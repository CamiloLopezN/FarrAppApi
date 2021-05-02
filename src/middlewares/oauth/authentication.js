const jwt = require('jsonwebtoken');
const roles = require('./roles');

const config = {
  expiresSessionIn: '1d',
  secretKey: process.env.JWT_KEY,
};

module.exports.authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized access' });
  try {
    req.payload = await jwt.verify(token, config.secretKey);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError)
      return res.status(403).json({ message: 'Invalid Token' });
    if (e instanceof jwt.TokenExpiredError)
      return res.status(403).json({ message: 'Token Expired' });
    return res.status(503).json({ message: 'Internal server error' });
  }
  return next();
};

module.exports.authenticationOrPublic = async (req, res, next) => {
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized access' }); // if there isn't any token

    await jwt.verify(token, config.secretKey, (err, payload) => {
      if (err) return res.status(403).json({ message: 'Invalid Token' });
      req.payload = payload;
      if (!payload.role === roles.company) return res.status(403).json({ message: 'Forbidden' });
      req.id = payload.roleId;
      return true;
    });
  }
  return next();
};

module.exports.authorize = (authorizedRoles) => {
  return async (req, res, next) => {
    let payloadRole;
    if (!req.payload) payloadRole = 'guest';
    else payloadRole = req.payload.role;

    if (!authorizedRoles.includes(payloadRole))
      return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
};

// TODO REEMPLAZAR EN MÉTODOS Y BORRAR
module.exports.authorizationAdmin = async (req, res, next) => {
  const { payload } = req;
  if (!payload.role === roles.admin) return res.status(403).json({ message: 'Forbidden' });
  req.id = payload.roleId;
  return next();
};

module.exports.authorizationClient = async (req, res, next) => {
  const { payload } = req;
  if (!payload.role === roles.client) return res.status(403).json({ message: 'Forbidden' });
  req.id = payload.roleId;
  return next();
};

module.exports.authorizationCompany = async (req, res, next) => {
  const { payload } = req;
  if (!payload.role === roles.company) return res.status(403).json({ message: 'Forbidden' });
  req.id = payload.roleId;
  return next();
};

module.exports.authorizationAdminOrCompany = (req, res, param) => {
  let id;
  if (req.payload.role === roles.admin) {
    id = param;
  } else if (req.payload.role === roles.company) {
    if (!req.payload.roleId === param)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    id = param;
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return id;
};

module.exports.authorizationAdminOrClient = (req, res, param) => {
  let id;
  if (req.payload.role === roles.admin) {
    id = param;
  } else if (req.payload.role === roles.client) {
    if (!req.payload.roleId === param)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    id = param;
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return id;
};

module.exports.generateToken = (payload) => {
  return jwt.sign(payload, config.secretKey, {
    expiresIn: config.expiresSessionIn,
  });
};
