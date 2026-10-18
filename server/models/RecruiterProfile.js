import mongoose from 'mongoose';

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title / Designation is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'About cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

const RecruiterProfile =
  mongoose.models.RecruiterProfile ||
  mongoose.model('RecruiterProfile', recruiterProfileSchema);

export default RecruiterProfile;
