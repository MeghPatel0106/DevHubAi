/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/**
 * Middleware: Validate Registration input fields
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  // Validate Name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  // Validate Email
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }

  // Validate Password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Optional Role validation
  if (role && !['developer', 'recruiter', 'admin'].includes(role)) {
    errors.push('Invalid user role specified');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  // Normalize email
  req.body.email = email.trim().toLowerCase();
  req.body.name = name.trim();

  next();
};

/**
 * Middleware: Validate Login input fields
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate Email
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }

  // Validate Password
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

export default {
  validateRegister,
  validateLogin,
};
