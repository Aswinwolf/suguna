import asyncHandler from '../utils/asyncHandler.js';
import Payment from '../models/Payment.js';
import ServiceBooking from '../models/ServiceBooking.js';
import Invoice from '../models/Invoice.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPublicKey,
  isRazorpayConfigured,
} from '../utils/razorpay.js';

// POST /api/payments/order  (user) — create a Razorpay order for a completed booking
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await ServiceBooking.findOne({ _id: bookingId, user: req.user._id });
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  if (booking.status !== 'Completed') {
    return res.status(400).json({ success: false, message: 'Booking is not ready for payment' });
  }
  if (booking.paymentStatus === 'Paid') {
    return res.status(400).json({ success: false, message: 'Booking is already paid' });
  }
  if (booking.totalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Nothing to pay for this booking' });
  }

  const order = await createRazorpayOrder({
    amount: booking.totalAmount,
    receipt: booking.bookingNumber,
  });

  // Upsert a pending Payment record tied to this booking.
  const payment = await Payment.findOneAndUpdate(
    { booking: booking._id },
    {
      booking: booking._id,
      user: req.user._id,
      orderId: order.id,
      amount: booking.totalAmount,
      currency: order.currency || 'INR',
      status: 'Pending',
      provider: order.mock ? 'mock' : 'razorpay',
    },
    { upsert: true, new: true }
  );

  res.json({
    orderId: order.id,
    amount: order.amount, // in paise
    currency: order.currency || 'INR',
    key: getPublicKey(),
    mock: Boolean(order.mock) || !isRazorpayConfigured(),
    bookingNumber: booking.bookingNumber,
    paymentId: payment._id,
  });
});

// POST /api/payments/verify  (user) — confirm payment after checkout
export const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, orderId, paymentId, signature } = req.body;

  const booking = await ServiceBooking.findOne({ _id: bookingId, user: req.user._id });
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const valid = verifyPaymentSignature({ orderId, paymentId, signature });
  const payment = await Payment.findOne({ booking: booking._id });

  if (!valid) {
    if (payment) {
      payment.status = 'Failed';
      await payment.save();
    }
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  if (payment) {
    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = 'Paid';
    await payment.save();
  }

  booking.paymentStatus = 'Paid';
  await booking.save();

  await Invoice.updateOne({ booking: booking._id }, { paymentStatus: 'Paid' });

  res.json({ success: true, message: 'Payment successful', bookingId: booking._id });
});

// GET /api/payments  (admin) — all payments
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'name email')
    .populate('booking', 'bookingNumber categoryName totalAmount status')
    .sort({ createdAt: -1 });
  res.json(payments);
});

// GET /api/payments/my  (user) — my payments
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('booking', 'bookingNumber categoryName totalAmount status')
    .sort({ createdAt: -1 });
  res.json(payments);
});
