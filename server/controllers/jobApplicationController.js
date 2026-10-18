import JobApplication from '../models/JobApplication.js';

/**
 * @desc    Get all job applications for authenticated user with search, filter, and sort
 * @route   GET /api/job-applications (or GET /api/applications)
 * @access  Private
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { status, workMode, employmentType, search, sortBy } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'All') {
      if (status === 'Wishlist') {
        filter.status = { $in: ['Wishlist', 'Saved'] };
      } else {
        filter.status = status;
      }
    }

    if (workMode && workMode !== 'All') {
      filter.workMode = workMode;
    }

    if (employmentType && employmentType !== 'All') {
      filter.employmentType = employmentType;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      filter.$or = [
        { company: { $regex: cleanSearch, $options: 'i' } },
        { position: { $regex: cleanSearch, $options: 'i' } },
        { jobTitle: { $regex: cleanSearch, $options: 'i' } },
        { location: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    // Determine sort order
    let sortOptions = { appliedDate: -1, createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { appliedDate: 1, createdAt: 1 };
    } else if (sortBy === 'interviewDate') {
      sortOptions = { interviewDate: 1, appliedDate: -1 };
    } else if (sortBy === 'company') {
      sortOptions = { company: 1 };
    } else if (sortBy === 'status') {
      sortOptions = { status: 1, appliedDate: -1 };
    }

    const applications = await JobApplication.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job application
 * @route   POST /api/job-applications (or POST /api/applications)
 * @access  Private
 */
export const createJobApplication = async (req, res, next) => {
  try {
    const {
      company,
      position,
      jobTitle,
      location,
      jobUrl,
      workMode,
      employmentType,
      status,
      appliedDate,
      deadline,
      interviewDate,
      salary,
      contactPerson,
      contactEmail,
      source,
      notes,
    } = req.body;

    const title = (jobTitle || position || '').trim();

    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Job title / Position is required',
      });
    }

    const application = await JobApplication.create({
      user: req.user._id,
      company: company.trim(),
      position: title,
      jobTitle: title,
      location: (location || '').trim(),
      jobUrl: (jobUrl || '').trim(),
      workMode: workMode || 'Remote',
      employmentType: employmentType || 'Full-time',
      status: status || 'Applied',
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      deadline: deadline ? new Date(deadline) : null,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      salary: (salary || '').trim(),
      contactPerson: (contactPerson || '').trim(),
      contactEmail: (contactEmail || '').trim(),
      source: (source || '').trim(),
      notes: (notes || '').trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Job application tracked successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job application by ID with ownership verification
 * @route   GET /api/job-applications/:id (or GET /api/applications/:id)
 * @access  Private
 */
export const getJobApplicationById = async (req, res, next) => {
  try {
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this job application',
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update job application with ownership verification
 * @route   PUT /api/job-applications/:id (or PUT /api/applications/:id)
 * @access  Private
 */
export const updateJobApplication = async (req, res, next) => {
  try {
    let application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job application',
      });
    }

    const updateData = { ...req.body };
    delete updateData.user;

    if (updateData.jobTitle && !updateData.position) {
      updateData.position = updateData.jobTitle;
    } else if (updateData.position && !updateData.jobTitle) {
      updateData.jobTitle = updateData.position;
    }

    application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Job application updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status only
 * @route   PATCH /api/job-applications/:id/status (or PATCH /api/applications/:id/status)
 * @access  Private
 */
export const updateJobApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'Wishlist',
      'Saved',
      'Applied',
      'Screening',
      'Interview',
      'Offer',
      'Rejected',
      'Withdrawn',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    let application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job application',
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application moved to ${status}`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete job application with ownership verification
 * @route   DELETE /api/job-applications/:id (or DELETE /api/applications/:id)
 * @access  Private
 */
export const deleteJobApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job application',
      });
    }

    await application.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Job application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getJobApplications,
  createJobApplication,
  getJobApplicationById,
  updateJobApplication,
  updateJobApplicationStatus,
  deleteJobApplication,
};
