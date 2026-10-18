import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate shortlisting by the same recruiter for the same candidate
shortlistSchema.index({ recruiter: 1, developer: 1 }, { unique: true });

const Shortlist =
  mongoose.models.Shortlist ||
  mongoose.model('Shortlist', shortlistSchema);

export default Shortlist;
