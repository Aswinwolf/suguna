import mongoose from 'mongoose';

// Address snapshot stored on the booking so historical records stay intact
// even if the user later edits or deletes the source address.
const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: String,
    mobile: String,
    houseNo: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    addressType: String,
  },
  { _id: false }
);

// Repair services performed (snapshot of RepairService master rows).
const repairLineSchema = new mongoose.Schema(
  {
    repairServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'RepairService' },
    name: { type: String, required: true },
    charge: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Spare parts used (snapshot of SparePart master rows) with quantity.
const spareLineSchema = new mongoose.Schema(
  {
    sparePartId: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

export const BOOKING_STATUSES = [
  'Pending',
  'Assigned',
  'Accepted',
  'In Progress',
  'Completed',
  'Cancelled',
];

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];

const serviceBookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    address: addressSnapshotSchema,
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    categoryName: { type: String, required: true },
    issue: {
      type: String,
      required: [true, 'Issue type is required'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'Pending',
    },

    // Completion details filled by the technician.
    repairServices: [repairLineSchema],
    spareParts: [spareLineSchema],
    notes: { type: String, trim: true },
    beforeImages: { type: [String], default: [] },
    afterImages: { type: [String], default: [] },

    // Billing breakdown (recomputed whenever completion details change).
    visitingCharge: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    spareCharge: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 18, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Pending',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

serviceBookingSchema.index({ user: 1, createdAt: -1 });
serviceBookingSchema.index({ technician: 1, status: 1 });
serviceBookingSchema.index({ status: 1 });

// Generate a human-friendly, sequential-ish booking number: SB-YYMMDD-XXXX
serviceBookingSchema.pre('save', function (next) {
  if (this.bookingNumber) return next();
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  this.bookingNumber = `SB-${stamp}-${rand}`;
  next();
});

const ServiceBooking = mongoose.model('ServiceBooking', serviceBookingSchema);

export default ServiceBooking;
