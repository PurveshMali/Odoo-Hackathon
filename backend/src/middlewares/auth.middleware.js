const { verifyAccessToken } = require('../config/jwt');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: verifyAccessToken
 * Extracts Bearer token from Authorization header,
 * verifies signature, and attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token is required.', 401, null);
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);
    req.user = decoded; // { userId, companyId, role, email }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token has expired. Please refresh.', 401, null);
    }
    return sendError(res, 'Invalid access token.', 401, null);
  }
};

module.exports = { verifyToken };
