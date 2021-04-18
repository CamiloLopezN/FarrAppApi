const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Company } = require('../models/entity.model');
const { generateToken } = require('../middlewares/oauth/authentication');

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  let token;
  try {
    const doc = await Company.findOne({ 'user.email': email });
    if (!doc) return res.status(400).send({ message: 'Incomplete or bad formatted data' });

    if (doc.user.isVerify && !doc.user.isVerify) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    if (!(await bcrypt.compare(password, doc.user.password))) {
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    }

    const payload = {
      // eslint-disable-next-line no-underscore-dangle
      id: doc._id,
      role: doc.user.role,
    };

    token = await generateToken(payload);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ token });
};
