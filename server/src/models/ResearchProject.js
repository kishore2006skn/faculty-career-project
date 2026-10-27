import mongoose from 'mongoose';
import { VERIFICATION_STATUSES } from '../config/constants.js';

const researchProjectSchema = new mongoose.Schema(
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
      required: [true, 'Please provide project title'],
      trim: true,
    },
    projectType: {
      type: String,
      enum: ['funded_project', 'consultancy'],
      default: 'funded_project',
    },
    fundingAgency: {
      type: String,
      required: [true, 'Please provide funding agency or client name'],
      trim: true,
    },
    grantAmount: {
      type: Number,
      required: [true, 'Please provide grant amount (INR)'],
      min: 0,
    },
    durationMonths: {
      type: Number,
      default: 12,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['sanctioned', 'ongoing', 'completed'],
      default: 'ongoing',
    },
    roleInProject: {
      type: String,
      enum: ['Principal Investigator (PI)', 'Co-Principal Investigator (Co-PI)', 'Consultant', 'Project Mentor'],
      default: 'Principal Investigator (PI)',
    },
    supportingDocUrl: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUSES),
      default: VERIFICATION_STATUSES.DRAFT,
    },
    reviewerComments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

researchProjectSchema.index({
  title: 'text',
  fundingAgency: 'text',
});

export default mongoose.model('ResearchProject', researchProjectSchema);
