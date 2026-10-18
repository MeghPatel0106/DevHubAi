import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Protect routes - Ensure incoming request is authenticated with a valid JWT
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-Only Cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization Header (Bearer <token>)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token exists, reject with 401
  if (!token || token === 'none') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authentication token provided',
    });
  }

  try {
    // Verify JWT
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token payload',
      });
    }

    // Attach active user to request object
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const isExpired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired
        ? 'Session has expired, please log in again'
        : 'Not authorized, authentication token verification failed',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'recruiter', 'developer')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user context missing',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

export default {
  protect,
  authorize,
};
