import mongoose from 'mongoose';

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceBooking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Razorpay identifiers.
    orderId: { type: String, index: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Pending',
    },
    // 'razorpay' for live gateway orders, 'mock' when keys are not configured.
    provider: { type: String, default: 'razorpay' },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
