const oauth = {};

const jwt = require('jsonwebtoken');
const roles = require('./roles');

const config = {
  expiresSessionIn: '1d',
};

oauth.authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token)
    return res
      .status(401)
      .json({ message: 'Acceso no autorizado, se debe proporcionar un token valido' }); // if there isn't any token

  await jwt.verify(token, process.env.KEY_SECRET_TOKEN, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Usuario invalido, el token no es valido' });
    req.payload = payload;
    return next();
  });
  return true;
};

oauth.authorizationAdmin = async (req, res, next) => {
  const { payload } = req;
  if (!payload.role === roles.adminRole) return res.status(403).json({ message: 'Forbidden' });
  req.id = payload.roleId;
  return next();
};

oauth.authorizationCompany = async (req, res, next) => {
  const { payload } = req;
  if (!payload.role === roles.companyRole) return res.status(403).json({ message: 'Forbidden' });
  req.id = payload.roleId;
  return next();
};

oauth.authorizationAdminOrCompany = (req, res, param) => {
  let id;
  if (req.payload.role === roles.adminRole) {
    id = param;
  } else if (req.payload.role === roles.companyRole) {
    if (!req.payload.roleId === param)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    id = param;
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return id;
};

oauth.generateToken = (payload) => {
  return jwt.sign(payload, process.env.KEY_SECRET_TOKEN, {
    expiresIn: config.expiresSessionIn,
  });
};

module.exports = oauth;
