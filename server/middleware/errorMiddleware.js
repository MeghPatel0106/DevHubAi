import config from '../config/default.js';

/**
 * 404 Not Found Middleware
 * Triggered when no route matches the incoming request.
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handling Middleware
 * Standardizes API error responses and hides internal implementation details.
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging in development
  if (config.nodeEnv === 'development') {
    console.error('⚠️ [API Error]:', err.name || 'Error', err.message);
  }

  // MongoDB Atlas IP Whitelist / Connection Error
  if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongooseServerSelectionError' ||
    (err.message && err.message.includes('SSL routines')) ||
    (err.message && err.message.includes('whitelist'))
  ) {
    return res.status(503).json({
      success: false,
      message:
        'Database connection unavailable. Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access (or set to Allow Access from Anywhere 0.0.0.0/0).',
      code: 'DATABASE_UNREACHABLE',
    });
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error.message = 'Resource not found with specified identifier';
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error.message = `An entry with this ${field} already exists`;
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages[0] || 'Validation error';
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: messages,
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
  }

  // Determine HTTP status
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

export default {
  notFoundHandler,
  errorHandler,
};
