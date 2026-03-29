const { db } = require('../config/db');

/**
 * Middleware: auditLogger
 * Fire-and-forget — logs every authenticated request to audit_logs.
 * NEVER awaited so it cannot block or fail the request lifecycle.
 *
 * MUST be used AFTER verifyToken middleware.
 * Pass action string via res.locals.auditAction or default to route path.
 */
const auditLogger = (action) => {
  return (req, res, next) => {
    // Fire and forget — no await
    setImmediate(() => {
      const actorId   = req.user?.userId || null;
      const ipAddress = req.ip || req.connection?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      const logAction = action || `${req.method}:${req.originalUrl}`;

      db('audit_logs')
        .insert({
          actor_id:   actorId,
          action:     logAction,
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata:   JSON.stringify({}),
        })
        .catch((err) => {
          // Log warning but never crash the app over audit failure
          console.warn('[AUDIT] Failed to write audit log:', err.message);
        });
    });

    next();
  };
};

module.exports = { auditLogger };
