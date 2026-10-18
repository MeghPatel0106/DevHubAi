import CareerGoal from '../models/CareerGoal.js';
import AIAnalysis from '../models/AIAnalysis.js';
import {
  aggregateUserContext,
  generateProfileAnalysis,
  answerCareerQuestion,
} from '../services/aiService.js';

/**
 * @desc    Get user's career goals
 * @route   GET /api/career-goals
 * @access  Private
 */
export const getCareerGoals = async (req, res, next) => {
  try {
    let goal = await CareerGoal.findOne({ user: req.user._id });
    if (!goal) {
      goal = await CareerGoal.create({
        user: req.user._id,
        targetRole: 'Full Stack Developer',
        experienceLevel: 'Junior',
        preferredLocation: 'Remote',
        primaryGoal: 'Get first job',
      });
    }
    return res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user's career goals
 * @route   PUT /api/career-goals
 * @access  Private
 */
export const updateCareerGoals = async (req, res, next) => {
  try {
    const {
      targetRole,
      experienceLevel,
      preferredLocation,
      targetIndustry,
      primaryGoal,
      targetCompanies,
    } = req.body;

    const updateFields = {};
    if (targetRole) updateFields.targetRole = targetRole.trim();
    if (experienceLevel) updateFields.experienceLevel = experienceLevel;
    if (preferredLocation) updateFields.preferredLocation = preferredLocation;
    if (targetIndustry) updateFields.targetIndustry = targetIndustry.trim();
    if (primaryGoal) updateFields.primaryGoal = primaryGoal;
    if (Array.isArray(targetCompanies)) updateFields.targetCompanies = targetCompanies;

    const goal = await CareerGoal.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Career goals updated successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get latest stored AI profile analysis
 * @route   GET /api/ai/latest-analysis
 * @access  Private
 */
export const getLatestAnalysis = async (req, res, next) => {
  try {
    let analysis = await AIAnalysis.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!analysis) {
      // Generate initial analysis automatically
      const context = await aggregateUserContext(req.user._id);
      const generated = await generateProfileAnalysis(context);
      analysis = await AIAnalysis.create({
        user: req.user._id,
        ...generated,
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Execute fresh AI profile analysis
 * @route   POST /api/ai/analyze-profile
 * @access  Private
 */
export const runProfileAnalysis = async (req, res, next) => {
  try {
    const { targetRole, experienceLevel, primaryGoal } = req.body || {};

    // Update career goals if provided
    if (targetRole || experienceLevel || primaryGoal) {
      await CareerGoal.findOneAndUpdate(
        { user: req.user._id },
        {
          $set: {
            ...(targetRole && { targetRole: targetRole.trim() }),
            ...(experienceLevel && { experienceLevel }),
            ...(primaryGoal && { primaryGoal }),
          },
        },
        { upsert: true, new: true }
      );
    }

    // Gather live, sanitized user context
    const context = await aggregateUserContext(req.user._id);

    // Generate comprehensive AI analysis
    const analysisResult = await generateProfileAnalysis(context);

    // Store record in database
    const savedAnalysis = await AIAnalysis.create({
      user: req.user._id,
      ...analysisResult,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile analysis completed successfully',
      data: savedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ask AI Career Advisor a contextual question
 * @route   POST /api/ai/career-question
 * @access  Private
 */
export const askCareerQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    if (question.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Question cannot exceed 1000 characters',
      });
    }

    // Gather user context to ground the response
    const context = await aggregateUserContext(req.user._id);
    const answer = await answerCareerQuestion(context, question.trim());

    return res.status(200).json({
      success: true,
      data: {
        question: question.trim(),
        answer,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCareerGoals,
  updateCareerGoals,
  getLatestAnalysis,
  runProfileAnalysis,
  askCareerQuestion,
};
