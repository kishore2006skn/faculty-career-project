import mongoose from 'mongoose';
import { ACHIEVEMENT_CATEGORIES, VERIFICATION_STATUSES } from '../config/constants.js';

const achievementSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide achievement title'],
      trim: true,
    },
    category: {
      type: String,
      enum: ACHIEVEMENT_CATEGORIES,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    issuingOrganization: {
      type: String,
      required: [true, 'Please provide issuing organization or venue'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },
    evidenceFileUrl: {
      type: String,
      default: '',
    },
    advancementPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUSES),
      default: VERIFICATION_STATUSES.DRAFT,
      index: true,
    },
    reviewerComments: {
      type: String,
      default: '',
    },
    assignedReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({
  title: 'text',
  issuingOrganization: 'text',
  description: 'text',
});

export default mongoose.model('Achievement', achievementSchema);
