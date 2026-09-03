import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service category name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Emoji or short icon token rendered on service cards.
    icon: {
      type: String,
      trim: true,
      default: '🛠️',
    },
    image: {
      type: String,
      trim: true,
    },
    // Base visiting / inspection charge applied when a booking is created.
    visitingCharge: {
      type: Number,
      default: 0,
      min: [0, 'Visiting charge cannot be negative'],
    },
    // Common issue types shown to the user during booking.
    issues: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceCategorySchema.index({ isActive: 1 });

const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);

export default ServiceCategory;
