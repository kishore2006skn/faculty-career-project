import mongoose from 'mongoose';

const facultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    facultyId: {
      type: String,
      required: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    officialEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    employmentStatus: {
      type: String,
      enum: ['Regular', 'Contract', 'Adjunct', 'Visiting', 'Probationary'],
      default: 'Regular',
    },
    highestQualification: {
      type: String,
      default: 'Ph.D.',
    },
    specialization: {
      type: String,
      default: '',
    },
    researchInterests: {
      type: [String],
      default: [],
    },
    orcidId: {
      type: String,
      trim: true,
      default: '',
    },
    googleScholarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    scopusId: {
      type: String,
      trim: true,
      default: '',
    },
    researchGateUrl: {
      type: String,
      trim: true,
      default: '',
    },
    linkedInUrl: {
      type: String,
      trim: true,
      default: '',
    },
    biography: {
      type: String,
      default: '',
    },
    experience: [
      {
        title: String,
        organization: String,
        startYear: String,
        endYear: String,
        isCurrent: Boolean,
        roleDescription: String,
      },
    ],
    coursesTaught: [
      {
        courseCode: String,
        courseName: String,
        academicYear: String,
        level: {
          type: String,
          enum: ['Undergraduate', 'Postgraduate', 'Doctoral'],
          default: 'Undergraduate',
        },
      },
    ],
    skillsAndCertifications: {
      type: [String],
      default: [],
    },
    profilePhotoUrl: {
      type: String,
      default: '',
    },
    completionPercentage: {
      type: Number,
      default: 20,
    },
    auditTrail: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to calculate completion percentage dynamically
facultyProfileSchema.methods.calculateCompletion = function () {
  const fields = [
    'fullName',
    'officialEmail',
    'phoneNumber',
    'department',
    'designation',
    'highestQualification',
    'specialization',
    'biography',
    'orcidId',
    'googleScholarUrl',
    'scopusId',
    'profilePhotoUrl',
  ];
  let filledCount = 0;
  for (const f of fields) {
    if (this[f] && this[f].toString().trim().length > 0) {
      filledCount++;
    }
  }
  if (this.researchInterests && this.researchInterests.length > 0) filledCount++;
  if (this.experience && this.experience.length > 0) filledCount++;
  if (this.coursesTaught && this.coursesTaught.length > 0) filledCount++;

  const totalFields = fields.length + 3;
  this.completionPercentage = Math.round((filledCount / totalFields) * 100);
  return this.completionPercentage;
};

export default mongoose.model('FacultyProfile', facultyProfileSchema);
