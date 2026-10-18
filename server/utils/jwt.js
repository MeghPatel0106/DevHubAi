import jwt from 'jsonwebtoken';
import config from '../config/default.js';

/**
 * Generate a signed JWT token with minimal payload (user ID)
 * @param {string} userId - User ID string
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire || '7d',
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token string
 * @returns {object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

/**
 * Helper to build secure cookie options
 * @returns {object} Cookie configuration options
 */
export const getCookieOptions = () => {
  const isProduction = config.nodeEnv === 'production';
  return {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
};

/**
 * Generate token, set HTTP-Only cookie, and send formatted JSON response
 * @param {object} user - Mongoose User document or plain user object
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {object} extraData - Optional additional data to return
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success', extraData = {}) => {
  const token = generateToken(user._id);
  const cookieOptions = getCookieOptions();

  // Set HTTP-Only authentication cookie
  res.cookie('token', token, cookieOptions);

  // Sanitize user object (ensure password is removed)
  const userData = user.toObject ? user.toObject() : { ...user };
  delete userData.password;

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
    ...extraData,
  });
};

/**
 * Clear authentication cookie
 * @param {object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  const isProduction = config.nodeEnv === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};

export default {
  generateToken,
  verifyToken,
  getCookieOptions,
  sendTokenResponse,
  clearTokenCookie,
};
