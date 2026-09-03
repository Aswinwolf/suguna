import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
    },
    houseNo: {
      type: String,
      required: [true, 'House number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street is required'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true,
    },
    // City/State are fixed to the current service area (Erode, Tamil Nadu).
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      default: 'Erode',
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Tamil Nadu',
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^638\d{3}$/, 'We currently serve Erode only (pincode 638xxx)'],
    },
    landmark: {
      type: String,
      trim: true,
    },
    addressType: {
      type: String,
      enum: ['Home', 'Office'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Fast lookups of a user's addresses and their default.
addressSchema.index({ user: 1, isDefault: -1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
