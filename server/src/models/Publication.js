import mongoose from 'mongoose';
import { PUBLICATION_CATEGORIES, VERIFICATION_STATUSES } from '../config/constants.js';

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  affiliation: { type: String, default: '' },
  isCorresponding: { type: Boolean, default: false },
  facultyUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contributionRole: { type: String, default: 'Author' }, // e.g., 'First Author', 'Corresponding Author', 'Co-Author'
});

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide publication title'],
      trim: true,
    },
    normalizedTitle: {
      type: String,
      trim: true,
      index: true,
    },
    abstract: {
      type: String,
      default: '',
    },
    publicationType: {
      type: String,
      enum: PUBLICATION_CATEGORIES,
      required: true,
      default: 'journal',
    },
    authors: [authorSchema],
    correspondingAuthor: {
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
    journalOrConferenceName: {
      type: String,
      required: [true, 'Please provide Journal or Conference or Publisher name'],
      trim: true,
    },
    publisher: {
      type: String,
      default: '',
    },
    publicationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },
    volume: { type: String, default: '' },
    issue: { type: String, default: '' },
    pageNumbers: { type: String, default: '' },
    doi: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    isbnIssn: {
      type: String,
      trim: true,
      default: '',
    },
    indexingDetails: {
      isScopus: { type: Boolean, default: false },
      isWoS: { type: Boolean, default: false },
      isUgcCare: { type: Boolean, default: false },
      quartile: {
        type: String,
        enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Unranked', 'None'],
        default: 'None',
      },
      verifiedByExternalApi: { type: Boolean, default: false },
      externalApiCheckedAt: { type: Date },
      externalSource: { type: String, default: '' },
    },
    citationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    citationsSource: {
      type: String,
      default: 'Self-Reported',
    },
    citationsLastChecked: {
      type: Date,
    },
    publisherUrl: {
      type: String,
      default: '',
    },
    conferenceLocation: {
      type: String,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
    fundingDetails: {
      type: String,
      default: '',
    },
    supportingDocUrl: {
      type: String,
      default: '',
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

// Pre-save hook to normalize title for duplicate detection
publicationSchema.pre('save', function (next) {
  if (this.title) {
    this.normalizedTitle = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }
  next();
});

// Text index for search
publicationSchema.index({
  title: 'text',
  journalOrConferenceName: 'text',
  abstract: 'text',
  keywords: 'text',
  doi: 'text',
});

export default mongoose.model('Publication', publicationSchema);
