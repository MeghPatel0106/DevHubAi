import Profile from '../models/Profile.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Certificate from '../models/Certificate.js';
import Resume from '../models/Resume.js';

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/profile/me
 * @access  Private
 */
export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate(
      'user',
      'name email role avatar'
    );

    if (!profile) {
      // Automatically initialize profile if missing
      profile = await Profile.create({
        user: req.user._id,
        fullName: req.user.name || '',
      });
    }

    // Automatically ensure profile has a real unique username and portfolioSlug
    if (!profile.username || !profile.portfolioSlug) {
      let baseSlug = (profile.fullName || req.user.name || req.user.email?.split('@')[0] || 'developer')
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
          user: { $ne: req.user._id },
        })
      ) {
        candidateSlug = `${baseSlug}-${count}`;
        count++;
      }

      if (!profile.username) profile.username = candidateSlug;
      if (!profile.portfolioSlug) profile.portfolioSlug = candidateSlug;
      await profile.save();
    }

    // Ensure completion score is dynamically calculated
    if (profile.calculateCompletion) {
      profile.calculateCompletion();
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current authenticated user's profile
 * @route   PUT /api/profile/me
 * @access  Private
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      headline,
      bio,
      location,
      website,
      personalWebsite,
      github,
      linkedin,
      twitter,
      currentRole,
      yearsOfExperience,
      preferredRole,
      preferredLocation,
      isPublic,
      recruiterDiscoverable,
      portfolioSlug,
      skills,
      experience,
      education,
      profileImage,
      username,
    } = req.body;

    const profileFields = {};

    // Validate and check username if provided
    if (username !== undefined) {
      const sanitizedUsername = username.toLowerCase().trim();
      if (sanitizedUsername && !/^[a-zA-Z0-9_-]{2,30}$/.test(sanitizedUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 2 and 30 alphanumeric characters (underscores and hyphens allowed)',
        });
      }

      if (sanitizedUsername) {
        const existingUser = await Profile.findOne({
          $or: [{ username: sanitizedUsername }, { portfolioSlug: sanitizedUsername }],
          user: { $ne: req.user._id },
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken by another developer',
          });
        }
        profileFields.username = sanitizedUsername;
      }
    }

    // Validate and check custom portfolio slug if provided
    if (portfolioSlug !== undefined) {
      const sanitizedSlug = portfolioSlug.toLowerCase().trim();
      if (sanitizedSlug && !/^[a-zA-Z0-9_-]{2,30}$/.test(sanitizedSlug)) {
        return res.status(400).json({
          success: false,
          message: 'Portfolio slug must be between 2 and 30 alphanumeric characters (underscores and hyphens allowed)',
        });
      }

      if (sanitizedSlug) {
        const existingSlug = await Profile.findOne({
          $or: [{ portfolioSlug: sanitizedSlug }, { username: sanitizedSlug }],
          user: { $ne: req.user._id },
        });
        if (existingSlug) {
          return res.status(400).json({
            success: false,
            message: 'This portfolio URL slug is already taken by another developer',
          });
        }
        profileFields.portfolioSlug = sanitizedSlug;
      }
    }

    // Other Profile Fields
    if (fullName !== undefined) profileFields.fullName = fullName.trim();
    if (headline !== undefined) profileFields.headline = headline.trim();
    if (bio !== undefined) profileFields.bio = bio;
    if (location !== undefined) profileFields.location = location.trim();
    if (website !== undefined) profileFields.website = website.trim();
    if (personalWebsite !== undefined) profileFields.personalWebsite = personalWebsite.trim();
    if (github !== undefined) profileFields.github = github.trim();
    if (linkedin !== undefined) profileFields.linkedin = linkedin.trim();
    if (twitter !== undefined) profileFields.twitter = twitter.trim();
    if (currentRole !== undefined) profileFields.currentRole = currentRole.trim();
    if (yearsOfExperience !== undefined) profileFields.yearsOfExperience = Number(yearsOfExperience) || 0;
    if (preferredRole !== undefined) profileFields.preferredRole = preferredRole.trim();
    if (preferredLocation !== undefined) profileFields.preferredLocation = preferredLocation.trim();
    if (isPublic !== undefined) profileFields.isPublic = Boolean(isPublic);
    if (recruiterDiscoverable !== undefined) profileFields.recruiterDiscoverable = Boolean(recruiterDiscoverable);
    if (skills !== undefined) profileFields.skills = Array.isArray(skills) ? skills : [];
    if (experience !== undefined) profileFields.experience = Array.isArray(experience) ? experience : [];
    if (education !== undefined) profileFields.education = Array.isArray(education) ? education : [];
    if (profileImage !== undefined) profileFields.profileImage = profileImage.trim();

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profileFields.user = req.user._id;
      profile = await Profile.create(profileFields);
    }

    // Recalculate dynamic profile completion score
    if (profile.calculateCompletion) {
      profile.calculateCompletion();
      await profile.save();
    }

    // Also sync User name and avatar if provided
    if (fullName || profileImage) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(fullName && { name: fullName.trim() }),
        ...(profileImage && { avatar: profileImage.trim() }),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sanitized public portfolio by username or slug
 * @route   GET /api/profile/public/:username (or GET /api/public/profile/:username)
 * @access  Public
 */
export const getPublicPortfolio = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username or slug parameter is required',
      });
    }

    const cleanQuery = username.toLowerCase().trim();

    // Find profile by username or portfolioSlug
    const profile = await Profile.findOne({
      $or: [{ username: cleanQuery }, { portfolioSlug: cleanQuery }],
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Developer portfolio not found',
      });
    }

    // Check portfolio visibility permission
    if (profile.isPublic === false) {
      return res.status(403).json({
        success: false,
        message: 'This developer portfolio is set to private by the owner',
        isPrivate: true,
      });
    }

    // Fetch verified technical skills for this user
    const skills = await Skill.find({ user: profile.user }).sort({
      category: 1,
      proficiency: -1,
    });

    // Fetch public projects (prioritizing featured projects)
    const projects = await Project.find({
      user: profile.user,
      isPublic: { $ne: false },
    }).sort({
      featured: -1,
      createdAt: -1,
    });

    // Fetch verified public certificates
    const certificates = await Certificate.find({
      user: profile.user,
      isPublic: { $ne: false },
    }).sort({
      issueDate: -1,
    });

    // Construct strictly sanitized public response (ZERO sensitive fields)
    const sanitizedPublicProfile = {
      fullName: profile.fullName || 'Developer',
      username: profile.username || '',
      portfolioSlug: profile.portfolioSlug || profile.username || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      location: profile.location || '',
      profileImage: profile.profileImage || '',
      website: profile.website || profile.personalWebsite || '',
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      twitter: profile.twitter || '',
      currentRole: profile.currentRole || '',
      yearsOfExperience: profile.yearsOfExperience || 0,
      preferredRole: profile.preferredRole || '',
      preferredLocation: profile.preferredLocation || '',
      experience: profile.experience || [],
      education: profile.education || [],
      profileCompletion: profile.profileCompletion || 0,
    };

    const sanitizedCertificates = certificates.map((c) => ({
      _id: c._id,
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      credentialId: c.credentialId,
      credentialUrl: c.credentialUrl,
      certificateImage: c.certificateImage,
    }));

    // Fetch public resume (default primary or latest updated)
    let publicResume = await Resume.findOne({
      user: profile.user,
      isDefault: true,
    });

    if (!publicResume) {
      publicResume = await Resume.findOne({ user: profile.user }).sort({ updatedAt: -1 });
    }

    let sanitizedResume = null;
    if (publicResume) {
      sanitizedResume = {
        _id: publicResume._id,
        title: publicResume.title || 'Professional Resume',
        summary: publicResume.summary || '',
        skills: publicResume.skills || [],
        experience: publicResume.experience || [],
        education: publicResume.education || [],
        projects: publicResume.projects || [],
        certifications: publicResume.certifications || [],
        template: publicResume.template || 'modern',
        updatedAt: publicResume.updatedAt,
      };
    }

    // Include public GitHub telemetry if connected and enabled
    let publicGitHub = null;
    if (profile.githubConnected && profile.githubShowOnPortfolio !== false && profile.githubData) {
      publicGitHub = {
        username: profile.githubUsername,
        profileUrl: profile.githubData.profile?.profileUrl || `https://github.com/${profile.githubUsername}`,
        avatarUrl: profile.githubData.profile?.avatarUrl,
        bio: profile.githubData.profile?.bio,
        publicRepos: profile.githubData.metrics?.publicRepos || 0,
        followers: profile.githubData.metrics?.followers || 0,
        totalStars: profile.githubData.metrics?.totalStars || 0,
        totalForks: profile.githubData.metrics?.totalForks || 0,
        primaryLanguage: profile.githubData.metrics?.primaryLanguage,
        topLanguages: profile.githubData.topLanguages || [],
        topRepositories: (profile.githubData.topRepositories || []).slice(0, 4),
        lastSyncedAt: profile.githubLastSyncedAt,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: sanitizedPublicProfile,
        skills,
        projects,
        certificates: sanitizedCertificates,
        resume: sanitizedResume,
        github: publicGitHub,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProfile,
  updateMyProfile,
  getPublicPortfolio,
};
