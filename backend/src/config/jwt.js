const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('[JWT] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env');
}

/**
 * Signs a short-lived access token (15 minutes).
 * Payload: { userId, companyId, role, email }
 */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'reimbursement-api',
  });
}

/**
 * Signs a long-lived refresh token (7 days).
 * Payload: { userId }
 */
function signRefreshToken(payload) {
  return jwt.sign({ userId: payload.userId }, REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'reimbursement-api',
  });
}

/**
 * Verifies an access token. Returns decoded payload or throws.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { issuer: 'reimbursement-api' });
}

/**
 * Verifies a refresh token. Returns decoded payload or throws.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET, { issuer: 'reimbursement-api' });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
