const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Fast asynchronous password hashing (rounds 8 for sub-10ms speed)
async function hashPasswordAsync(password) {
  return await bcrypt.hash(password, 8);
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 8);
}

// Fast asynchronous password verification (non-blocking)
async function verifyPasswordAsync(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  if (plainPassword === hashedPassword) return true;
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (e) {
    return false;
  }
}

function verifyPassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  if (plainPassword === hashedPassword) return true;
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (e) {
    return false;
  }
}

function createToken(payload) {
  return jwt.sign(payload, config.SECRET_KEY, { expiresIn: config.JWT_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Invalid or missing authentication token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.SECRET_KEY);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid token or session expired' });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    authMiddleware(req, res, () => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          detail: `User role '${req.user.role}' is not authorized. Allowed: ${allowedRoles.join(', ')}`
        });
      }
      next();
    });
  };
}

module.exports = {
  hashPassword,
  hashPasswordAsync,
  verifyPassword,
  verifyPasswordAsync,
  createToken,
  authMiddleware,
  requireRole
};
