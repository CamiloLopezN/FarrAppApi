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

  await jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
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

oauth.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: config.expiresSessionIn,
  });
};

module.exports = oauth;
