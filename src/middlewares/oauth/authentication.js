const oauth = {};

const jwt = require('jsonwebtoken');

const config = {
  expiresSessionIn: '1d',
};

oauth.authorizeCompany = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null)
    return res
      .status(401)
      .json({ message: 'Acceso no autorizado, se debe proporcionar un token valido' }); // if there isn't any token

  jwt.verify(token, process.env.KEY_SECRET_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ message: 'Usuario invalido, el token no es valido' });
    // eslint-disable-next-line no-underscore-dangle
    if (user.rol !== 'company') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user.id;
    return next();
  });
  return next();
};

oauth.generateToken = (payload) => {
  return jwt.sign(payload, process.env.KEY_SECRET_TOKEN, {
    expiresIn: config.expiresSessionIn,
  });
};

module.exports = oauth;
