import User from '../models/User.js';
import Profile from '../models/Profile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/jwt.js';

/**
 * @desc    Register a new user (Developer or Recruiter)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'developer',
      companyName,
      jobTitle,
      companyWebsite,
      linkedinUrl,
    } = req.body;

    // Validate email and name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Role-specific validation
    const accountRole = role === 'recruiter' ? 'recruiter' : 'developer';
    if (accountRole === 'recruiter') {
      if (!companyName || !companyName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required for recruiter accounts',
        });
      }
      if (!jobTitle || !jobTitle.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Job title is required for recruiter accounts',
        });
      }
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create new user (password is hashed automatically by pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: accountRole,
    });

    // Create role-specific initial profile document linked to user
    let profileDoc = null;
    if (accountRole === 'recruiter') {
      profileDoc = await RecruiterProfile.create({
        user: user._id,
        fullName: user.name,
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        companyWebsite: (companyWebsite || '').trim(),
        linkedinUrl: (linkedinUrl || '').trim(),
      });
    } else {
      // Developer profile initialization
      try {
        let baseSlug = (user.name || user.email?.split('@')[0] || 'developer')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        if (!baseSlug || baseSlug.length < 2) baseSlug = 'developer';

        let candidateSlug = baseSlug;
        let count = 1;
        while (
          await Profile.findOne({
            $or: [{ username: candidateSlug }, { portfolioSlug: candidateSlug }],
          })
        ) {
          candidateSlug = `${baseSlug}-${count}`;
          count++;
        }

        profileDoc = await Profile.create({
          user: user._id,
          fullName: user.name,
          username: candidateSlug,
          portfolioSlug: candidateSlug,
          headline: 'Software Developer',
          bio: '',
          skills: [],
          recruiterDiscoverable: false,
        });
      } catch (profileErr) {
        console.warn('Initial developer profile creation note:', profileErr.message);
      }
    }

    // Send JWT token in HTTP-only cookie and sanitized response
    return sendTokenResponse(user, 201, res, 'Account created successfully', {
      profile: profileDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user and explicitly select hidden password field
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    let profile = null;
    if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    } else {
      profile = await Profile.findOne({ user: user._id });
    }

    // Return token in HTTP-only cookie and response
    return sendTokenResponse(user, 200, res, 'Logged in successfully', {
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile & session
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware protect
    const user = req.user;

    let profile = null;
    if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    } else {
      profile = await Profile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Authenticated user session retrieved',
      user,
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log user out & clear HTTP-Only cookie
 * @route   POST /api/auth/logout
 * @access  Public (or Private)
 */
export const logoutUser = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};
