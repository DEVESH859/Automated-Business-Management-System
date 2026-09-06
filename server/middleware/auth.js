const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../authConfig');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(503).json({ msg: 'Authentication is not configured on the server' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.employee = decoded;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
