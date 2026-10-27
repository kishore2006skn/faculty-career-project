import mongoose from 'mongoose';

const generatedReportSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['publication_summary', 'career_advancement', 'department_overview'],
      default: 'publication_summary',
    },
    title: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'json'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    filters: {
      academicYear: { type: String, default: 'All' },
      startDate: { type: Date },
      endDate: { type: Date },
      department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
      publicationCategories: [String],
      includeAchievements: { type: Boolean, default: true },
      includeAdvancement: { type: Boolean, default: true },
      onlyApproved: { type: Boolean, default: false },
      template: { type: String, default: 'standard_institutional' },
    },
    summarySnapshot: {
      totalPublications: { type: Number, default: 0 },
      approvedPublications: { type: Number, default: 0 },
      journalArticles: { type: Number, default: 0 },
      conferencePapers: { type: Number, default: 0 },
      booksOrChapters: { type: Number, default: 0 },
      patents: { type: Number, default: 0 },
      totalCitations: { type: Number, default: 0 },
      totalAchievements: { type: Number, default: 0 },
      advancementPointsEarned: { type: Number, default: 0 },
      advancementStatus: { type: String, default: 'Pending Evaluation' },
    },
  },
  {
    timestamps: true,
  }
);

generatedReportSchema.index({ creator: 1, createdAt: -1 });
generatedReportSchema.index({ faculty: 1 });

export default mongoose.model('GeneratedReport', generatedReportSchema);
