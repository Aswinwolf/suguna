import asyncHandler from '../utils/asyncHandler.js';
import Invoice from '../models/Invoice.js';
import ServiceBooking from '../models/ServiceBooking.js';
import { generateInvoiceForBooking } from '../utils/invoice.js';

// GET /api/invoices/booking/:bookingId — owner, assigned technician, or admin
export const getInvoiceByBooking = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findById(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const isOwner = booking.user.equals(req.user._id);
  const isAssignedTech = booking.technician && booking.technician.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAssignedTech && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
  }

  if (booking.status !== 'Completed') {
    return res
      .status(400)
      .json({ success: false, message: 'Invoice is available after the service is completed' });
  }

  // Generate on-demand if it does not exist yet (idempotent).
  const invoice = await generateInvoiceForBooking(booking);

  res.json({ invoice, booking });
});

// GET /api/invoices/my  (user)
export const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id })
    .populate('booking', 'bookingNumber categoryName status')
    .sort({ createdAt: -1 });
  res.json(invoices);
});

// GET /api/invoices  (admin)
export const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find()
    .populate('user', 'name email')
    .populate('booking', 'bookingNumber categoryName status')
    .sort({ createdAt: -1 });
  res.json(invoices);
});
