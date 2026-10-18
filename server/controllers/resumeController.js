import Resume from '../models/Resume.js';

/**
 * @desc    Get all resumes for authenticated user
 * @route   GET /api/resumes
 * @access  Private
 */
export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new resume
 * @route   POST /api/resumes
 * @access  Private
 */
export const createResume = async (req, res, next) => {
  try {
    const { title, summary, skills, experience, education, projects, certifications, template, fileUrl, isDefault, personal } = req.body;

    // If marked as default, reset other resumes for this user
    if (isDefault) {
      await Resume.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const resume = await Resume.create({
      user: req.user._id,
      title: title || 'Primary Resume',
      personal: personal || {},
      summary: summary || '',
      skills: Array.isArray(skills) ? skills : [],
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      certifications: certifications || [],
      template: template || 'modern',
      fileUrl: fileUrl || '',
      isDefault: Boolean(isDefault),
    });


    return res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single resume by ID with ownership verification
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resume',
      });
    }

    return res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update resume with ownership verification
 * @route   PUT /api/resumes/:id
 * @access  Private
 */
export const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resume',
      });
    }

    if (req.body.isDefault) {
      await Resume.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const updateData = { ...req.body };
    delete updateData.user;

    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete resume with ownership verification
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resume',
      });
    }

    await resume.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set a resume as the user's default resume
 * @route   PATCH /api/resumes/:id/default
 * @access  Private
 */
export const setDefaultResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this resume',
      });
    }

    // Reset all user resumes to non-default
    await Resume.updateMany({ user: req.user._id }, { isDefault: false });

    // Set selected resume to default
    resume.isDefault = true;
    await resume.save();

    return res.status(200).json({
      success: true,
      message: 'Default resume updated successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getResumes,
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
  setDefaultResume,
};
