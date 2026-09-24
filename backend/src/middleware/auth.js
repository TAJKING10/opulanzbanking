const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start without it.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'opulanz-super-secret-jwt-key-2025-change-in-production';

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

function extractToken(req, preferredCookieName) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookies = parseCookies(req);
  if (preferredCookieName && cookies[preferredCookieName]) {
    return cookies[preferredCookieName];
  }
  return cookies['spv_investor_token'] || cookies['spv_admin_token'] || cookies['auth_token'] || null;
}

function requireAuth(req, res, next) {
  const token = extractToken(req, 'auth_token');
  if (!token) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireSpvInvestor(req, res, next) {
  const token = extractToken(req, 'spv_investor_token');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Investor authorization required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'spv_investor') {
      return res.status(403).json({ success: false, error: 'Forbidden: Investor access required' });
    }
    req.user = decoded;
    req.spvUser = decoded;
    req.investor = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired investor session' });
  }
}

function requireSpvAdmin(req, res, next) {
  const token = extractToken(req, 'spv_admin_token');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Admin authorization required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'spv_admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin privileges required' });
    }
    req.user = decoded;
    req.spvUser = decoded;
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin session' });
  }
}

function requireSpvAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'spv_investor' && decoded.role !== 'spv_admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Invalid role' });
    }
    req.user = decoded;
    req.spvUser = decoded;
    if (decoded.role === 'spv_admin') {
      req.admin = decoded;
    } else {
      req.investor = decoded;
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }
}

module.exports = {
  JWT_SECRET,
  requireAuth,
  requireSpvInvestor,
  requireSpvAdmin,
  requireSpvAuth,
};
