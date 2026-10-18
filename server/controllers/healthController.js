import mongoose from 'mongoose';
import config from '../config/default.js';
import connectDB from '../config/db.js';

const getDatabaseStatus = () => {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    case 0:
    default:
      return 'disconnected';
  }
};

/**
 * @desc    Health Check Endpoint
 * @route   GET /api/health
 * @access  Public
 */
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Certificate from '../models/Certificate.js';
import Resume from '../models/Resume.js';
import JobApplication from '../models/JobApplication.js';
import AIAnalysis from '../models/AIAnalysis.js';
import CareerGoal from '../models/CareerGoal.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import Shortlist from '../models/Shortlist.js';
import RecruiterNote from '../models/RecruiterNote.js';

export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DevHub AI API is running healthy and strong',
    environment: config.nodeEnv,
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
};

/**
 * @desc    Get complete database user audit (for safe cleanup review)
 * @route   GET /api/health/db-audit
 * @access  Public / Internal
 */
export const getDatabaseAudit = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const users = await User.find({}).sort({ createdAt: 1 }).lean();

    const userAudits = [];

    for (const user of users) {
      const userId = user._id;

      const [
        profilesCount,
        projectsCount,
        skillsCount,
        certificatesCount,
        resumesCount,
        applicationsCount,
        aiAnalysesCount,
        careerGoalsCount,
        recruiterProfilesCount,
        shortlistsAsRecruiter,
        shortlistsAsDeveloper,
        recruiterNotesAsRecruiter,
        recruiterNotesAsDeveloper,
      ] = await Promise.all([
        Profile.countDocuments({ user: userId }),
        Project.countDocuments({ user: userId }),
        Skill.countDocuments({ user: userId }),
        Certificate.countDocuments({ user: userId }),
        Resume.countDocuments({ user: userId }),
        JobApplication.countDocuments({ user: userId }),
        AIAnalysis.countDocuments({ user: userId }),
        CareerGoal.countDocuments({ user: userId }),
        RecruiterProfile.countDocuments({ user: userId }),
        Shortlist.countDocuments({ recruiter: userId }),
        Shortlist.countDocuments({ developer: userId }),
        RecruiterNote.countDocuments({ recruiter: userId }),
        RecruiterNote.countDocuments({ developer: userId }),
      ]);

      const isTestPattern =
        user.email.includes('_1787') ||
        user.email.startsWith('devtester_') ||
        user.email.startsWith('user2_') ||
        user.email.startsWith('attacker_') ||
        user.email.startsWith('elena.rostova_') ||
        user.email.startsWith('qa_user_') ||
        user.email.startsWith('dev_p11_') ||
        user.email.startsWith('reca_p11_') ||
        user.email.startsWith('recb_p11_') ||
        user.email.startsWith('dev_reg_') ||
        user.email.startsWith('rec_reg_') ||
        user.email === 'alex.developer@devhub.ai';

      userAudits.push({
        id: userId.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        classification: isTestPattern ? 'DEMO/TEST/DUMMY' : 'REAL/KEEP',
        records: {
          profiles: profilesCount,
          projects: projectsCount,
          skills: skillsCount,
          certificates: certificatesCount,
          resumes: resumesCount,
          jobApplications: applicationsCount,
          aiAnalyses: aiAnalysesCount,
          careerGoals: careerGoalsCount,
          recruiterProfiles: recruiterProfilesCount,
          shortlists: shortlistsAsRecruiter + shortlistsAsDeveloper,
          recruiterNotes: recruiterNotesAsRecruiter + recruiterNotesAsDeveloper,
        },
      });
    }

    const validUserIds = users.map((u) => u._id);
    const [
      orphanProfiles,
      orphanProjects,
      orphanSkills,
      orphanCertificates,
      orphanResumes,
      orphanJobApplications,
      orphanAIAnalyses,
      orphanCareerGoals,
      orphanRecruiterProfiles,
      orphanShortlists,
      orphanRecruiterNotes,
    ] = await Promise.all([
      Profile.countDocuments({ user: { $nin: validUserIds } }),
      Project.countDocuments({ user: { $nin: validUserIds } }),
      Skill.countDocuments({ user: { $nin: validUserIds } }),
      Certificate.countDocuments({ user: { $nin: validUserIds } }),
      Resume.countDocuments({ user: { $nin: validUserIds } }),
      JobApplication.countDocuments({ user: { $nin: validUserIds } }),
      AIAnalysis.countDocuments({ user: { $nin: validUserIds } }),
      CareerGoal.countDocuments({ user: { $nin: validUserIds } }),
      RecruiterProfile.countDocuments({ user: { $nin: validUserIds } }),
      Shortlist.countDocuments({
        $or: [{ recruiter: { $nin: validUserIds } }, { developer: { $nin: validUserIds } }],
      }),
      RecruiterNote.countDocuments({
        $or: [{ recruiter: { $nin: validUserIds } }, { developer: { $nin: validUserIds } }],
      }),
    ]);

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users: userAudits,
      orphanedRecords: {
        profiles: orphanProfiles,
        projects: orphanProjects,
        skills: orphanSkills,
        certificates: orphanCertificates,
        resumes: orphanResumes,
        jobApplications: orphanJobApplications,
        aiAnalyses: orphanAIAnalyses,
        careerGoals: orphanCareerGoals,
        recruiterProfiles: orphanRecruiterProfiles,
        shortlists: orphanShortlists,
        recruiterNotes: orphanRecruiterNotes,
      },
    });
  } catch (error) {
    next(error);
  }
};
