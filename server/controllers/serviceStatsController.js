import asyncHandler from '../utils/asyncHandler.js';
import ServiceBooking from '../models/ServiceBooking.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// GET /api/service-stats  (admin) — dashboard metrics for the service module
export const getServiceStats = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    completedServices,
    activeTechnicians,
    pendingPayments,
    revenueAgg,
    statusAgg,
  ] = await Promise.all([
    ServiceBooking.countDocuments(),
    ServiceBooking.countDocuments({ status: 'Completed' }),
    User.countDocuments({ role: 'technician', isActive: true }),
    ServiceBooking.countDocuments({ status: 'Completed', paymentStatus: 'Pending' }),
    Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    ServiceBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusBreakdown = statusAgg.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  res.json({
    totalBookings,
    completedServices,
    activeTechnicians,
    pendingPayments,
    revenue: revenueAgg[0]?.total || 0,
    statusBreakdown,
  });
});
