const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const roles = require('../middlewares/oauth/roles');
const { authorize } = require('../middlewares/oauth/authentication');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const CDN_URL = process.env.AWS_CLOUDFRONT;
const s3 = new AWS.S3();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
  }
};

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter: imageFileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fns = file.originalname.split('.');
      const fileExtension = fns[fns.length - 1];
      const location = req.path.substring(1);
      cb(null, `${location}/${Date.now()}.${fileExtension}`);
    },
  }),
});

// eslint-disable-next-line consistent-return
const validateImageUploaded = (req, res, err) => {
  if (err instanceof multer.MulterError) {
    return res.status(406).send({
      errors: [{ title: 'File Upload Error', detail: err.message }],
    });
  }
  if (err) {
    return res.status(400).send({
      errors: [{ title: 'Unexpected error', detail: err.message }],
    });
  }
};

const singleUploadHandler = (req, res, fieldName) => {
  if (req.file === undefined) return res.status(400).json({ message: 'Bad request' });
  const uploadImage = upload.single(fieldName);

  uploadImage(req, res, (err) => {
    if (err) return validateImageUploaded(req, res, err);
    const resImage = {};
    resImage[`${req.file.fieldname}`] = `${CDN_URL}/${req.file.key}`;
    return res.status(200).json(resImage);
  });
};

const multiUploadHandler = (req, res, fieldName, maxCount) => {
  if (req.files === undefined) return res.status(400).json({ message: 'Bad request' });
  const uploadImage = upload.array(fieldName, maxCount);

  uploadImage(req, res, (err) => {
    if (err) return validateImageUploaded(req, res, err);
    return res.status(200).json(
      req.files.map((photo) => {
        const resImage = {};
        resImage[`${photo.fieldname}`] = `${CDN_URL}/${photo.key}`;
        return resImage;
      }),
    );
  });
};

const establishmentLogo = (req, res) => {
  singleUploadHandler(req, res, 'logo');
};
module.exports.establishmentLogo = [authorize([roles.company, roles.admin]), establishmentLogo];

const establishmentPhotos = (req, res) => {
  multiUploadHandler(req, res, 'photo', 7);
};
module.exports.establishmentPhotos = [authorize([roles.company, roles.admin]), establishmentPhotos];

const eventPhotos = (req, res) => {
  multiUploadHandler(req, res, 'photo', 5);
};
module.exports.eventPhotos = [authorize([roles.company, roles.admin]), eventPhotos];
