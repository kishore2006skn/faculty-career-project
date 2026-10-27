import mongoose from 'mongoose';

const criteriaRuleSchema = new mongoose.Schema({
  category: { type: String, required: true },
  label: { type: String, required: true },
  pointsPerItem: { type: Number, required: true, default: 5 },
  minRequiredCount: { type: Number, default: 0 },
  maxPointsCap: { type: Number, default: 50 },
  requiresVerification: { type: Boolean, default: true },
  evidenceRequired: { type: Boolean, default: true },
  description: { type: String, default: '' },
});

const stageRequirementSchema = new mongoose.Schema({
  stageName: { type: String, required: true }, // e.g., 'Level 10 to Level 11', 'Assistant to Associate Professor'
  fromDesignation: { type: String, required: true },
  toDesignation: { type: String, required: true },
  minYearsOfService: { type: Number, default: 4 },
  minTotalPoints: { type: Number, required: true, default: 50 },
  minJournalPublications: { type: Number, default: 2 },
  minFdpAttended: { type: Number, default: 2 },
  minResearchGrantsAmount: { type: Number, default: 0 },
  guidelinesNotes: { type: String, default: '' },
});

const advancementPolicySchema = new mongoose.Schema(
  {
    policyName: {
      type: String,
      required: [true, 'Please provide policy name'],
      trim: true,
    },
    version: {
      type: String,
      required: true,
      default: 'v1.0',
    },
    institutionName: {
      type: String,
      default: 'Apex Institute of Technology & Research',
    },
    description: {
      type: String,
      default: 'Institutional Faculty Career Advancement Scheme & Scoring Framework',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    criteriaRules: [criteriaRuleSchema],
    stages: [stageRequirementSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AdvancementPolicy', advancementPolicySchema);
