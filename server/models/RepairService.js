import mongoose from 'mongoose';

/**
 * Master list of repair services a technician can select after completing a job
 * (e.g. Gas Refill, Compressor Repair). Each carries a standard service charge.
 */
const repairServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Repair service name is required'],
      trim: true,
    },
    // Optional scoping to a service category (null = applies to all categories).
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      default: null,
    },
    charge: {
      type: Number,
      required: [true, 'Charge is required'],
      min: [0, 'Charge cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

repairServiceSchema.index({ serviceCategory: 1, isActive: 1 });

const RepairService = mongoose.model('RepairService', repairServiceSchema);

export default RepairService;
