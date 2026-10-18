import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      trim: true,
      required: true,
      default: 'Full Stack Developer',
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      default: 0,
    },
    categoryScores: {
      profile: { type: Number, min: 0, max: 100, default: 0 },
      skills: { type: Number, min: 0, max: 100, default: 0 },
      projects: { type: Number, min: 0, max: 100, default: 0 },
      experience: { type: Number, min: 0, max: 100, default: 0 },
      github: { type: Number, min: 0, max: 100, default: 0 },
      resume: { type: Number, min: 0, max: 100, default: 0 },
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    strengths: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        impact: { type: String, trim: true },
      },
    ],
    weaknesses: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        suggestion: { type: String, trim: true },
      },
    ],
    skillGaps: [
      {
        skill: { type: String, trim: true },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
        reason: { type: String, trim: true },
        recommendedLearning: { type: String, trim: true },
        targetProficiency: { type: String, trim: true, default: 'Intermediate' },
      },
    ],
    roadmap: [
      {
        phaseNumber: { type: Number },
        title: { type: String, trim: true },
        duration: { type: String, trim: true },
        goals: [{ type: String, trim: true }],
        skillsToLearn: [{ type: String, trim: true }],
        actionItems: [{ type: String, trim: true }],
      },
    ],
    recommendedProjects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        techStack: [{ type: String, trim: true }],
        fillsGap: { type: String, trim: true },
        difficulty: { type: String, enum: ['Intermediate', 'Advanced'], default: 'Intermediate' },
      },
    ],
    interviewTopics: [
      {
        category: { type: String, trim: true },
        topics: [{ type: String, trim: true }],
        practiceTips: { type: String, trim: true },
      },
    ],
    nextActions: [
      {
        action: { type: String, trim: true },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
        category: { type: String, trim: true },
        pageLink: { type: String, trim: true },
      },
    ],
    lastAnalyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AIAnalysis =
  mongoose.models.AIAnalysis || mongoose.model('AIAnalysis', aiAnalysisSchema);

export default AIAnalysis;
