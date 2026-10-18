import User from '../models/User.js';
import Profile from '../models/Profile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Shortlist from '../models/Shortlist.js';
import RecruiterNote from '../models/RecruiterNote.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Certificate from '../models/Certificate.js';
import Resume from '../models/Resume.js';
import mongoose from 'mongoose';

/**
 * @desc    Get authenticated recruiter profile
 * @route   GET /api/recruiter/profile
 * @access  Private (Recruiter only)
 */
export const getRecruiterProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await RecruiterProfile.create({
        user: req.user._id,
        fullName: req.user.name,
        companyName: 'Company',
        jobTitle: 'Technical Recruiter',
      });
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
 * @desc    Update authenticated recruiter profile
 * @route   PUT /api/recruiter/profile
 * @access  Private (Recruiter only)
 */
export const updateRecruiterProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      companyName,
      jobTitle,
      companyWebsite,
      linkedinUrl,
      profileImage,
      location,
      about,
    } = req.body;

    const updateFields = {};
    if (fullName) updateFields.fullName = fullName.trim();
    if (companyName) updateFields.companyName = companyName.trim();
    if (jobTitle) updateFields.jobTitle = jobTitle.trim();
    if (companyWebsite !== undefined) updateFields.companyWebsite = companyWebsite.trim();
    if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl.trim();
    if (profileImage !== undefined) updateFields.profileImage = profileImage.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (about !== undefined) updateFields.about = about.trim();

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    if (fullName || profileImage) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(fullName && { name: fullName.trim() }),
        ...(profileImage && { avatar: profileImage.trim() }),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter dashboard statistics and overview
 * @route   GET /api/recruiter/dashboard
 * @access  Private (Recruiter only)
 */
export const getRecruiterDashboardStats = async (req, res, next) => {
  try {
    const [discoverableCount, shortlistCount, notesCount, recentShortlists] =
      await Promise.all([
        Profile.countDocuments({
          isPublic: { $ne: false },
          recruiterDiscoverable: true,
        }),
        Shortlist.countDocuments({ recruiter: req.user._id }),
        RecruiterNote.countDocuments({ recruiter: req.user._id }),
        Shortlist.find({ recruiter: req.user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('developer', 'name avatar')
          .lean(),
      ]);

    // Enhance recent shortlists with profile data
    const developerUserIds = recentShortlists
      .map((s) => s.developer?._id)
      .filter(Boolean);

    const profiles = await Profile.find({
      user: { $in: developerUserIds },
    })
      .select('user fullName headline portfolioSlug location profileImage')
      .lean();

    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.user.toString(), p));

    const enrichedShortlists = recentShortlists.map((s) => {
      const devId = s.developer?._id?.toString();
      const p = devId ? profileMap.get(devId) : null;
      return {
        _id: s._id,
        developerId: devId,
        name: p?.fullName || s.developer?.name || 'Developer',
        headline: p?.headline || 'Software Engineer',
        portfolioSlug: p?.portfolioSlug || '',
        location: p?.location || '',
        profileImage: p?.profileImage || s.developer?.avatar || '',
        shortlistedAt: s.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        discoverableCount,
        shortlistCount,
        notesCount,
        recentShortlists: enrichedShortlists,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search and filter discoverable developer talent
 * @route   GET /api/recruiter/candidates
 * @access  Private (Recruiter only)
 */
export const findCandidates = async (req, res, next) => {
  try {
    const {
      search,
      role,
      skill,
      location,
      hasProjects,
      hasCertificates,
      githubConnected,
      sortBy = 'recent',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Strict filter: ONLY published portfolios with discoverability enabled
    const query = {
      isPublic: { $ne: false },
      recruiterDiscoverable: true,
    };

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { fullName: { $regex: cleanSearch, $options: 'i' } },
        { headline: { $regex: cleanSearch, $options: 'i' } },
        { bio: { $regex: cleanSearch, $options: 'i' } },
        { skills: { $regex: cleanSearch, $options: 'i' } },
        { currentRole: { $regex: cleanSearch, $options: 'i' } },
        { preferredRole: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    if (role && role.trim()) {
      const cleanRole = role.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { headline: { $regex: cleanRole, $options: 'i' } },
          { currentRole: { $regex: cleanRole, $options: 'i' } },
          { preferredRole: { $regex: cleanRole, $options: 'i' } },
        ],
      });
    }

    if (skill && skill.trim()) {
      query.skills = { $regex: skill.trim(), $options: 'i' };
    }

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (githubConnected === 'true') {
      query.githubConnected = true;
    }

    let sortOptions = { updatedAt: -1 };
    if (sortBy === 'name') {
      sortOptions = { fullName: 1 };
    } else if (sortBy === 'completion') {
      sortOptions = { profileCompletion: -1, updatedAt: -1 };
    }

    const [total, rawProfiles] = await Promise.all([
      Profile.countDocuments(query),
      Profile.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    ]);

    const userIds = rawProfiles.map((p) => p.user);

    // Get current recruiter shortlists for fast lookup
    const myShortlists = await Shortlist.find({
      recruiter: req.user._id,
      developer: { $in: userIds },
    }).lean();
    const shortlistedSet = new Set(
      myShortlists.map((s) => s.developer.toString())
    );

    // Query counts of public projects, skills, certificates for these users
    const [skillsGroup, projectsGroup, certsGroup] = await Promise.all([
      Skill.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', skills: { $push: '$name' } } },
      ]),
      Project.aggregate([
        { $match: { user: { $in: userIds }, isPublic: { $ne: false } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
      ]),
      Certificate.aggregate([
        { $match: { user: { $in: userIds }, isPublic: { $ne: false } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
      ]),
    ]);

    const skillMap = new Map();
    skillsGroup.forEach((g) => skillMap.set(g._id.toString(), g.skills));

    const projectCountMap = new Map();
    projectsGroup.forEach((g) => projectCountMap.set(g._id.toString(), g.count));

    const certCountMap = new Map();
    certsGroup.forEach((g) => certCountMap.set(g._id.toString(), g.count));

    // Construct sanitized candidate items
    let candidates = rawProfiles.map((p) => {
      const uId = p.user.toString();
      const userSkills = skillMap.get(uId) || p.skills || [];
      const projectCount = projectCountMap.get(uId) || 0;
      const certCount = certCountMap.get(uId) || 0;

      return {
        _id: p._id,
        developerId: uId,
        fullName: p.fullName || 'Developer',
        headline: p.headline || 'Software Developer',
        bio: p.bio || '',
        location: p.location || '',
        portfolioSlug: p.portfolioSlug || p.username || '',
        profileImage: p.profileImage || '',
        yearsOfExperience: p.yearsOfExperience || 0,
        skills: userSkills.slice(0, 8),
        projectCount,
        certCount,
        githubConnected: Boolean(p.githubConnected),
        githubUsername: p.githubUsername || '',
        publicRepos: p.githubData?.metrics?.publicRepos || 0,
        totalStars: p.githubData?.metrics?.totalStars || 0,
        isShortlisted: shortlistedSet.has(uId),
        updatedAt: p.updatedAt,
      };
    });

    // Optional post-filters
    if (hasProjects === 'true') {
      candidates = candidates.filter((c) => c.projectCount > 0);
    }
    if (hasCertificates === 'true') {
      candidates = candidates.filter((c) => c.certCount > 0);
    }

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive sanitized public candidate profile
 * @route   GET /api/recruiter/candidates/:id
 * @access  Private (Recruiter only)
 */
export const getCandidateDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate identifier',
      });
    }

    // Lookup profile by user id or profile id with strict discoverability check
    const profile = await Profile.findOne({
      $or: [{ _id: id }, { user: id }],
      isPublic: { $ne: false },
      recruiterDiscoverable: true,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found or not discoverable by recruiters',
      });
    }

    const developerUserId = profile.user;

    // Fetch verified public resources
    const [skills, projects, certificates, resume, notes, isShortlisted] =
      await Promise.all([
        Skill.find({ user: developerUserId }).sort({ category: 1, proficiency: -1 }).lean(),
        Project.find({ user: developerUserId, isPublic: { $ne: false } }).sort({ featured: -1, createdAt: -1 }).lean(),
        Certificate.find({ user: developerUserId, isPublic: { $ne: false } }).sort({ issueDate: -1 }).lean(),
        Resume.findOne({ user: developerUserId, isDefault: true }).lean(),
        RecruiterNote.find({ recruiter: req.user._id, developer: developerUserId }).sort({ createdAt: -1 }).lean(),
        Shortlist.exists({ recruiter: req.user._id, developer: developerUserId }),
      ]);

    // Construct sanitized candidate detail payload
    const candidateData = {
      _id: profile._id,
      developerId: developerUserId.toString(),
      fullName: profile.fullName || 'Developer',
      headline: profile.headline || 'Software Developer',
      bio: profile.bio || '',
      location: profile.location || '',
      profileImage: profile.profileImage || '',
      portfolioSlug: profile.portfolioSlug || profile.username || '',
      yearsOfExperience: profile.yearsOfExperience || 0,
      currentRole: profile.currentRole || '',
      preferredRole: profile.preferredRole || '',
      preferredLocation: profile.preferredLocation || '',
      website: profile.website || profile.personalWebsite || '',
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      twitter: profile.twitter || '',
      experience: profile.experience || [],
      education: profile.education || [],
      skills: skills.map((s) => ({
        _id: s._id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        yearsOfExperience: s.yearsOfExperience,
        verified: Boolean(s.verified),
      })),
      projects: projects.map((p) => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        technologies: p.technologies || p.techStack || [],
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
        featured: Boolean(p.featured),
      })),
      certificates: certificates.map((c) => ({
        _id: c._id,
        title: c.title,
        issuer: c.issuer,
        issueDate: c.issueDate,
        credentialUrl: c.credentialUrl,
        credentialId: c.credentialId,
      })),
      resume: resume
        ? {
            _id: resume._id,
            title: resume.title,
            summary: resume.summary,
            template: resume.template,
            updatedAt: resume.updatedAt,
          }
        : null,
      githubSummary: profile.githubConnected && profile.githubData
        ? {
            username: profile.githubUsername,
            publicRepos: profile.githubData.metrics?.publicRepos || 0,
            totalStars: profile.githubData.metrics?.totalStars || 0,
            primaryLanguage: profile.githubData.metrics?.primaryLanguage,
            topLanguages: profile.githubData.topLanguages || [],
          }
        : null,
      isShortlisted: Boolean(isShortlisted),
      notes,
    };

    return res.status(200).json({
      success: true,
      data: candidateData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all shortlisted candidates for authenticated recruiter
 * @route   GET /api/recruiter/shortlists
 * @access  Private (Recruiter only)
 */
export const getShortlists = async (req, res, next) => {
  try {
    const shortlists = await Shortlist.find({ recruiter: req.user._id })
      .sort({ createdAt: -1 })
      .populate('developer', 'name email avatar')
      .lean();

    const developerIds = shortlists.map((s) => s.developer?._id).filter(Boolean);

    // Fetch linked profiles
    const profiles = await Profile.find({ user: { $in: developerIds } }).lean();
    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.user.toString(), p));

    // Fetch recruiter note counts for each developer
    const noteCounts = await RecruiterNote.aggregate([
      { $match: { recruiter: req.user._id, developer: { $in: developerIds } } },
      { $group: { _id: '$developer', count: { $sum: 1 } } },
    ]);
    const noteCountMap = new Map();
    noteCounts.forEach((nc) => noteCountMap.set(nc._id.toString(), nc.count));

    const enriched = shortlists.map((s) => {
      const devId = s.developer?._id?.toString();
      const p = devId ? profileMap.get(devId) : null;
      return {
        _id: s._id,
        developerId: devId,
        fullName: p?.fullName || s.developer?.name || 'Developer',
        headline: p?.headline || 'Software Developer',
        bio: p?.bio || '',
        location: p?.location || '',
        portfolioSlug: p?.portfolioSlug || p?.username || '',
        profileImage: p?.profileImage || s.developer?.avatar || '',
        skills: (p?.skills || []).slice(0, 6),
        yearsOfExperience: p?.yearsOfExperience || 0,
        notesCount: devId ? (noteCountMap.get(devId) || 0) : 0,
        shortlistedAt: s.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add developer to recruiter's shortlist
 * @route   POST /api/recruiter/shortlists/:developerId
 * @access  Private (Recruiter only)
 */
export const addToShortlist = async (req, res, next) => {
  try {
    const { developerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(developerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid developer identifier',
      });
    }

    // Verify developer exists and is discoverable
    const profile = await Profile.findOne({
      user: developerId,
      isPublic: { $ne: false },
      recruiterDiscoverable: true,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Developer profile is not discoverable or does not exist',
      });
    }

    const shortlist = await Shortlist.findOneAndUpdate(
      { recruiter: req.user._id, developer: developerId },
      { $setOnInsert: { recruiter: req.user._id, developer: developerId } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Candidate added to shortlist successfully',
      data: shortlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove developer from recruiter's shortlist
 * @route   DELETE /api/recruiter/shortlists/:developerId
 * @access  Private (Recruiter only)
 */
export const removeFromShortlist = async (req, res, next) => {
  try {
    const { developerId } = req.params;

    await Shortlist.findOneAndDelete({
      recruiter: req.user._id,
      developer: developerId,
    });

    return res.status(200).json({
      success: true,
      message: 'Candidate removed from shortlist',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter's private notes for a developer
 * @route   GET /api/recruiter/candidates/:developerId/notes
 * @access  Private (Recruiter only)
 */
export const getCandidateNotes = async (req, res, next) => {
  try {
    const { developerId } = req.params;

    const notes = await RecruiterNote.find({
      recruiter: req.user._id,
      developer: developerId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a private recruiter note for a developer
 * @route   POST /api/recruiter/candidates/:developerId/notes
 * @access  Private (Recruiter only)
 */
export const createCandidateNote = async (req, res, next) => {
  try {
    const { developerId } = req.params;
    const { content, stage } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required',
      });
    }

    const note = await RecruiterNote.create({
      recruiter: req.user._id,
      developer: developerId,
      content: content.trim(),
      stage: stage || 'Review',
    });

    return res.status(201).json({
      success: true,
      message: 'Private recruiter note saved',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a private recruiter note
 * @route   PUT /api/recruiter/notes/:id
 * @access  Private (Recruiter only)
 */
export const updateCandidateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, stage } = req.body;

    const note = await RecruiterNote.findOne({
      _id: id,
      recruiter: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not authorized',
      });
    }

    if (content) note.content = content.trim();
    if (stage) note.stage = stage;
    await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a private recruiter note
 * @route   DELETE /api/recruiter/notes/:id
 * @access  Private (Recruiter only)
 */
export const deleteCandidateNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await RecruiterNote.findOneAndDelete({
      _id: id,
      recruiter: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not authorized',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterDashboardStats,
  findCandidates,
  getCandidateDetails,
  getShortlists,
  addToShortlist,
  removeFromShortlist,
  getCandidateNotes,
  createCandidateNote,
  updateCandidateNote,
  deleteCandidateNote,
};
