import Project from '../models/Project.js';

/**
 * @desc    Get all projects for authenticated user
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({
      featured: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project (scoped to authenticated user)
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      technologies,
      category,
      githubUrl,
      liveUrl,
      image,
      startDate,
      endDate,
      featured,
      status,
      isPublic,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Project title and description are required',
      });
    }

    // Always associate with req.user._id (never trust frontend user parameter)
    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : [],
      category: category || 'Full Stack',
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      image: image || '',
      startDate,
      endDate,
      featured: Boolean(featured),
      isPublic: isPublic !== false,
      status: status || 'completed',
    });


    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID with ownership verification
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check user ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project with ownership verification
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check user ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project',
      });
    }

    // Exclude 'user' field from update to prevent tampering
    const updateData = { ...req.body };
    delete updateData.user;

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project with ownership verification
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check user ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
