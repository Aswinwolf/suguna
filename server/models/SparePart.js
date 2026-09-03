import mongoose from 'mongoose';

/**
 * Master list of spare parts a technician can add to a completed job
 * (e.g. Capacitor, Compressor). Priced per unit; quantity is set per booking.
 */
const sparePartSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Spare part name is required'],
      trim: true,
    },
    // Optional scoping to a service category (null = applies to all categories).
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      default: null,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

sparePartSchema.index({ serviceCategory: 1, isActive: 1 });

const SparePart = mongoose.model('SparePart', sparePartSchema);

export default SparePart;
