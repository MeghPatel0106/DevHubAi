import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    issuer: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
      maxlength: [150, 'Issuer cannot exceed 150 characters'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expiryDate: {
      type: Date,
    },
    credentialId: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    certificateImage: {
      type: String,
      trim: true,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rapid user-specific and public certificate retrieval
certificateSchema.index({ user: 1, issueDate: -1 });
certificateSchema.index({ user: 1, isPublic: 1, issueDate: -1 });

const Certificate =
  mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

export default Certificate;
