/**
 * Shared Admin Authentication Middleware
 *
 * Uses ADMIN_PASSWORD from env. When set, every protected route must send
 * header: x-admin-token: <password>
 *
 * In development, if ADMIN_PASSWORD is unset, requests are allowed (with a warning)
 * so local work is not blocked — but production MUST set ADMIN_PASSWORD.
 */

function adminAuth(req, res, next) {
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminPass) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        success: false,
        error: 'Admin access is not configured. Set ADMIN_PASSWORD.',
      });
    }
    console.warn('[adminAuth] ADMIN_PASSWORD not set — allowing request (dev only)');
    return next();
  }

  const token = req.headers['x-admin-token'];
  if (!token || token !== adminPass) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

/**
 * Optional: require admin only when the request is an admin action
 * (e.g. support message with sender_type === 'admin').
 */
function adminAuthIfAdminSender(req, res, next) {
  if (req.body && req.body.sender_type === 'admin') {
    return adminAuth(req, res, next);
  }
  next();
}

module.exports = { adminAuth, adminAuthIfAdminSender };
