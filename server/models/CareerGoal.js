import mongoose from 'mongoose';

const careerGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    targetRole: {
      type: String,
      trim: true,
      default: 'Full Stack Developer',
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Intern', 'Junior', 'Mid-level', 'Senior'],
      default: 'Junior',
    },
    preferredLocation: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Any'],
      default: 'Remote',
    },
    targetIndustry: {
      type: String,
      trim: true,
      default: 'SaaS & Web Engineering',
    },
    primaryGoal: {
      type: String,
      enum: [
        'Get first job',
        'Get internship',
        'Switch role',
        'Prepare for interviews',
        'Become job-ready',
        'Improve current profile',
      ],
      default: 'Get first job',
    },
    targetCompanies: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CareerGoal =
  mongoose.models.CareerGoal || mongoose.model('CareerGoal', careerGoalSchema);

export default CareerGoal;
