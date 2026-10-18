import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position / Job Title is required'],
      trim: true,
      maxlength: [150, 'Position cannot exceed 150 characters'],
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    workMode: {
      type: String,
      enum: {
        values: ['Remote', 'Hybrid', 'On-site'],
        message: '{VALUE} is not a valid work mode',
      },
      default: 'Remote',
    },
    employmentType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'Full-time',
    },
    status: {
      type: String,
      enum: {
        values: [
          'Wishlist',
          'Saved',
          'Applied',
          'Screening',
          'Interview',
          'Offer',
          'Rejected',
          'Withdrawn',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Applied',
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    interviewDate: {
      type: Date,
    },
    salary: {
      type: String,
      trim: true,
      default: '',
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize position and jobTitle before validation
jobApplicationSchema.pre('validate', function () {
  if (this.position && !this.jobTitle) {
    this.jobTitle = this.position;
  } else if (this.jobTitle && !this.position) {
    this.position = this.jobTitle;
  }
});

// Compound indexes for fast status filtering, sorting, and user queries
jobApplicationSchema.index({ user: 1, status: 1, appliedDate: -1 });
jobApplicationSchema.index({ user: 1, interviewDate: 1 });

const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
