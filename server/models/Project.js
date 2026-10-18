import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      default: 'Full Stack',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['in-progress', 'completed', 'archived', 'In Progress', 'Completed', 'Archived'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'completed',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying by user, public visibility, featured status, and creation date
projectSchema.index({ user: 1, isPublic: 1, featured: -1, createdAt: -1 });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
