import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Job position is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    school: {
      type: String,
      required: [true, 'School or university name is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    fieldOfStudy: {
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
    current: {
      type: Boolean,
      default: false,
    },
    grade: {
      type: String,
      trim: true,
      default: '',
    },
    activities: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
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
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [200, 'Headline cannot exceed 200 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    personalWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
    currentRole: {
      type: String,
      trim: true,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    preferredRole: {
      type: String,
      trim: true,
      default: '',
    },
    preferredLocation: {
      type: String,
      trim: true,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    recruiterDiscoverable: {
      type: Boolean,
      default: false,
      index: true,
    },
    portfolioSlug: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: [experienceSchema],
    education: [educationSchema],
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    githubUsername: {
      type: String,
      trim: true,
      default: '',
    },
    githubConnected: {
      type: Boolean,
      default: false,
    },
    githubShowOnPortfolio: {
      type: Boolean,
      default: true,
    },
    githubLastSyncedAt: {
      type: Date,
    },
    githubData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate dynamic profile completion percentage based on actual profile data
profileSchema.methods.calculateCompletion = function () {
  let score = 0;
  if (this.fullName && this.fullName.trim() !== '') score += 10;
  if (this.username && this.username.trim() !== '') score += 10;
  if (this.headline && this.headline.trim() !== '') score += 15;
  if (this.bio && this.bio.trim() !== '') score += 15;
  if (this.location && this.location.trim() !== '') score += 10;
  if (this.profileImage && this.profileImage.trim() !== '') score += 5;
  if (this.github || this.linkedin || this.website || this.personalWebsite) score += 10;
  if (this.skills && this.skills.length > 0) score += 10;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 10;
  this.profileCompletion = Math.min(score, 100);
  return this.profileCompletion;
};

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;
