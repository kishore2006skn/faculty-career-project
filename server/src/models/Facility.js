import mongoose from 'mongoose';

const equipmentItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      default: '',
    },
    manufacturer: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Operational', 'Maintenance', 'Calibrating'],
      default: 'Operational',
    },
    approxValueInr: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility / Lab name is required'],
      trim: true,
    },
    facilityCode: {
      type: String,
      required: [true, 'Unique facility code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    location: {
      type: String,
      required: true,
      default: 'Academic Block A, Level 2',
    },
    facultyInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    labTechnician: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    researchDomains: {
      type: [String],
      default: [],
    },
    workstationCapacity: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['Operational', 'Under Upgrade', 'Maintenance'],
      default: 'Operational',
    },
    equipmentList: [equipmentItemSchema],
    softwareTools: {
      type: [String],
      default: [],
    },
    industryPartners: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

facilitySchema.index({ name: 'text', description: 'text', facilityCode: 1 });

export default mongoose.model('Facility', facilitySchema);
