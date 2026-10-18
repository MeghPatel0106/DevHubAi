import Skill from '../models/Skill.js';

/**
 * @desc    Get all skills for authenticated user
 * @route   GET /api/skills
 * @access  Private
 */
export const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({
      category: 1,
      proficiency: -1,
    });

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/skills
 * @access  Private
 */
export const createSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency, yearsOfExperience, verified } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required',
      });
    }

    const skill = await Skill.create({
      user: req.user._id,
      name,
      category: category || 'Programming',
      proficiency: proficiency || 'Intermediate',
      yearsOfExperience: Number(yearsOfExperience) || 0,
      verified: Boolean(verified),
    });

    return res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update skill with ownership verification
 * @route   PUT /api/skills/:id
 * @access  Private
 */
export const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this skill',
      });
    }

    const updateData = { ...req.body };
    delete updateData.user;

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete skill with ownership verification
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this skill',
      });
    }

    await skill.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
