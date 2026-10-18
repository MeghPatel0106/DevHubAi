import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'Programming',
          'Frontend',
          'Backend',
          'Framework',
          'Database',
          'DevOps',
          'Cloud',
          'AI/ML',
          'Tools',
          'Other',
        ],
        message: '{VALUE} is not a supported skill category',
      },
      default: 'Programming',
      index: true,
    },
    proficiency: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: '{VALUE} is not a valid proficiency level',
      },
      default: 'Intermediate',
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and skill name, allowing rapid search and sorting by category
skillSchema.index({ user: 1, category: 1, name: 1 });

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);

export default Skill;
