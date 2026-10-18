import mongoose from 'mongoose';

const recruiterNoteSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required'],
      index: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Developer reference is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [5000, 'Note content cannot exceed 5000 characters'],
    },
    stage: {
      type: String,
      enum: {
        values: ['Review', 'Screening', 'Interviewing', 'Offer', 'Archived'],
        message: '{VALUE} is not a valid note stage',
      },
      default: 'Review',
    },
  },
  {
    timestamps: true,
  }
);

recruiterNoteSchema.index({ recruiter: 1, developer: 1, createdAt: -1 });

const RecruiterNote =
  mongoose.models.RecruiterNote ||
  mongoose.model('RecruiterNote', recruiterNoteSchema);

export default RecruiterNote;
