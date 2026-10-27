import mongoose from 'mongoose';
import { VERIFICATION_STATUSES } from '../config/constants.js';

const reviewSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['Publication', 'Achievement', 'ResearchProject'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    title: {
      type: String,
      default: '',
    },
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
    assignedReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUSES),
      default: VERIFICATION_STATUSES.SUBMITTED,
    },
    decision: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_correction'],
      default: 'pending',
    },
    comments: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    history: [
      {
        status: String,
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ department: 1, status: 1 });
reviewSchema.index({ faculty: 1 });

export default mongoose.model('Review', reviewSchema);
