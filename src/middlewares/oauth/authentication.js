require('dotenv').config();

const jwt = require('jsonwebtoken');
const roles = require('./roles');

const config = {
  expiresSessionIn: '1d',
  secretKey: process.env.JWT_KEY,
};

module.exports.authentication = async (req, res, next) => {
  if (!req.headers.authorization) return next();
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

module.exports.authorize = (authorizedRoles) => {
  return async (req, res, next) => {
    let payloadRole;
    if (!req.payload) payloadRole = roles.guest;
    else payloadRole = req.payload.role;

    if (!authorizedRoles.includes(payloadRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
};

module.exports.generateToken = (payload) => {
  return jwt.sign(payload, config.secretKey, {
    expiresIn: config.expiresSessionIn,
  });
};
