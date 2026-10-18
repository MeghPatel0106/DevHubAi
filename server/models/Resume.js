import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      default: 'Primary Resume',
    },
    personal: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    education: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    certifications: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    template: {
      type: String,
      trim: true,
      default: 'modern',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user resumes with default resume on top
resumeSchema.index({ user: 1, isDefault: -1, updatedAt: -1 });

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;
