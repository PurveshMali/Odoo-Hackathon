const { sendError } = require('../utils/apiResponse');

/**
 * Middleware factory: requireRole
 * Usage: requireRole('admin') or requireRole('admin', 'manager')
 *
 * MUST be used AFTER verifyToken middleware — requires req.user to exist.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401, null);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}.`,
        403,
        null
      );
    }

    next();
  };
};

module.exports = { requireRole };
