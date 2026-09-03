import asyncHandler from '../utils/asyncHandler.js';
import ServiceBooking from '../models/ServiceBooking.js';
import ServiceCategory from '../models/ServiceCategory.js';
import Address from '../models/Address.js';
import User from '../models/User.js';
import { calculateBill } from '../utils/billing.js';
import { generateInvoiceForBooking } from '../utils/invoice.js';
import { isErodePincode } from '../utils/serviceArea.js';

const snapshotAddress = (addr) => ({
  fullName: addr.fullName,
  mobile: addr.mobile,
  houseNo: addr.houseNo,
  street: addr.street,
  area: addr.area,
  city: addr.city,
  state: addr.state,
  pincode: addr.pincode,
  landmark: addr.landmark,
  addressType: addr.addressType,
});

// ------------------------- USER -------------------------

// POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { serviceCategory, issue, addressId, scheduledDate, timeSlot } = req.body;

  const category = await ServiceCategory.findById(serviceCategory);
  if (!category || !category.isActive) {
    return res.status(400).json({ success: false, message: 'Invalid or inactive service category' });
  }

  // Resolve address: explicit addressId, else the user's default address.
  let address;
  if (addressId) {
    address = await Address.findOne({ _id: addressId, user: req.user._id });
  } else {
    address = await Address.findOne({ user: req.user._id, isDefault: true });
  }
  if (!address) {
    return res
      .status(400)
      .json({ success: false, message: 'A delivery address is required. Please add one first.' });
  }

  // Service-area guard: bookings are only accepted for Erode (638xxx) addresses.
  if (!isErodePincode(address.pincode)) {
    return res.status(400).json({
      success: false,
      message: 'We currently serve Erode only. Please use an Erode address (pincode 638xxx).',
    });
  }

  // Initial bill = visiting charge + tax on it. Completion adds parts/labour.
  const bill = calculateBill({
    repairServices: [],
    spareParts: [],
    visitingCharge: category.visitingCharge,
  });

  const booking = await ServiceBooking.create({
    user: req.user._id,
    addressId: address._id,
    address: snapshotAddress(address),
    serviceCategory: category._id,
    categoryName: category.name,
    issue,
    scheduledDate,
    timeSlot,
    status: 'Pending',
    visitingCharge: bill.visitingCharge,
    serviceCharge: bill.serviceCharge,
    spareCharge: bill.spareCharge,
    taxRate: bill.taxRate,
    tax: bill.tax,
    totalAmount: bill.totalAmount,
  });

  res.status(201).json(booking);
});

// GET /api/bookings/my
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await ServiceBooking.find({ user: req.user._id })
    .populate('technician', 'name phone')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// GET /api/bookings/:id  — owner, assigned technician, or admin
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findById(req.params.id)
    .populate('technician', 'name phone email')
    .populate('user', 'name email');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const isOwner = booking.user._id.equals(req.user._id);
  const isAssignedTech = booking.technician && booking.technician._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAssignedTech && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
  }

  res.json(booking);
});

// PATCH /api/bookings/:id/cancel  — user cancels own booking
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  if (['Completed', 'Cancelled'].includes(booking.status)) {
    return res
      .status(400)
      .json({ success: false, message: `Cannot cancel a ${booking.status.toLowerCase()} booking` });
  }
  booking.status = 'Cancelled';
  await booking.save();
  res.json(booking);
});

// ------------------------- ADMIN -------------------------

// GET /api/bookings  (admin) — optional ?status=&technician=
export const getAllBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.technician) filter.technician = req.query.technician;

  const bookings = await ServiceBooking.find(filter)
    .populate('user', 'name email')
    .populate('technician', 'name phone')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// PATCH /api/bookings/:id/assign  (admin) — assign or reassign a technician
export const assignTechnician = asyncHandler(async (req, res) => {
  const { technicianId } = req.body;

  const technician = await User.findOne({ _id: technicianId, role: 'technician' });
  if (!technician) {
    return res.status(400).json({ success: false, message: 'Invalid technician' });
  }

  const booking = await ServiceBooking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  if (['Completed', 'Cancelled'].includes(booking.status)) {
    return res
      .status(400)
      .json({ success: false, message: `Cannot assign a ${booking.status.toLowerCase()} booking` });
  }

  booking.technician = technician._id;
  booking.status = 'Assigned';
  await booking.save();

  const populated = await booking.populate('technician', 'name phone');
  res.json(populated);
});

// ------------------------- TECHNICIAN -------------------------

// GET /api/bookings/assigned  (technician) — jobs assigned to me
export const getAssignedBookings = asyncHandler(async (req, res) => {
  const filter = { technician: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const bookings = await ServiceBooking.find(filter)
    .populate('user', 'name email')
    .sort({ scheduledDate: 1 });
  res.json(bookings);
});

// Guard: the booking must belong to the requesting technician.
const findAssignedBooking = async (bookingId, technicianId) =>
  ServiceBooking.findOne({ _id: bookingId, technician: technicianId });

// PATCH /api/bookings/:id/accept  (technician)
export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await findAssignedBooking(req.params.id, req.user._id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Assigned booking not found' });
  }
  if (booking.status !== 'Assigned') {
    return res.status(400).json({ success: false, message: 'Only assigned bookings can be accepted' });
  }
  booking.status = 'Accepted';
  await booking.save();
  res.json(booking);
});

// PATCH /api/bookings/:id/start  (technician)
export const startBooking = asyncHandler(async (req, res) => {
  const booking = await findAssignedBooking(req.params.id, req.user._id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Assigned booking not found' });
  }
  if (booking.status !== 'Accepted') {
    return res.status(400).json({ success: false, message: 'Only accepted bookings can be started' });
  }
  booking.status = 'In Progress';
  await booking.save();
  res.json(booking);
});

// PATCH /api/bookings/:id/complete  (technician) — record work + generate bill
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await findAssignedBooking(req.params.id, req.user._id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Assigned booking not found' });
  }
  if (!['Accepted', 'In Progress'].includes(booking.status)) {
    return res
      .status(400)
      .json({ success: false, message: 'Booking must be accepted/in progress to complete' });
  }

  const {
    repairServices = [],
    spareParts = [],
    notes = '',
    beforeImages = [],
    afterImages = [],
  } = req.body;

  // Proof-of-work requirement: at least one "after" photo is mandatory.
  const cleanAfter = (Array.isArray(afterImages) ? afterImages : []).map((s) => String(s).trim()).filter(Boolean);
  const cleanBefore = (Array.isArray(beforeImages) ? beforeImages : []).map((s) => String(s).trim()).filter(Boolean);
  if (cleanAfter.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one "after work" photo is required to complete the job.',
    });
  }

  const bill = calculateBill({
    repairServices,
    spareParts,
    visitingCharge: booking.visitingCharge,
    taxRate: booking.taxRate,
  });

  booking.repairServices = repairServices.map((r) => ({
    repairServiceId: r.repairServiceId || r._id,
    name: r.name,
    charge: Number(r.charge) || 0,
  }));
  booking.spareParts = bill.spareLines.map((s) => ({
    sparePartId: s.sparePartId || s._id,
    name: s.name,
    price: s.price,
    quantity: s.quantity,
    amount: s.amount,
  }));
  booking.notes = notes;
  booking.beforeImages = cleanBefore;
  booking.afterImages = cleanAfter;
  booking.serviceCharge = bill.serviceCharge;
  booking.spareCharge = bill.spareCharge;
  booking.tax = bill.tax;
  booking.totalAmount = bill.totalAmount;
  booking.status = 'Completed';
  booking.completedAt = new Date();

  await booking.save();

  // Generate the invoice for the completed job.
  await generateInvoiceForBooking(booking);

  res.json(booking);
});

// GET /api/bookings/technician/summary  (technician) — dashboard cards
export const getTechnicianSummary = asyncHandler(async (req, res) => {
  const techId = req.user._id;
  const [assigned, pending, inProgress, completed, earningsAgg] = await Promise.all([
    ServiceBooking.countDocuments({ technician: techId }),
    ServiceBooking.countDocuments({
      technician: techId,
      status: { $in: ['Assigned', 'Accepted'] },
    }),
    ServiceBooking.countDocuments({ technician: techId, status: 'In Progress' }),
    ServiceBooking.countDocuments({ technician: techId, status: 'Completed' }),
    ServiceBooking.aggregate([
      { $match: { technician: techId, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$serviceCharge' } } },
    ]),
  ]);

  res.json({
    assigned,
    pending,
    inProgress,
    completed,
    earnings: earningsAgg[0]?.total || 0,
  });
});
