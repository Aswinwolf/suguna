import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  assignTechnician,
  getAssignedBookings,
  acceptBooking,
  startBooking,
  completeBooking,
  getTechnicianSummary,
} from '../controllers/serviceBookingController.js';
import { protect, adminOnly, technicianOnly, authorize } from '../middleware/authMiddleware.js';
import { validate, bookingRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

// User — only customers (role 'user') may create/cancel bookings.
router.post('/', authorize('user'), bookingRules, validate, createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', authorize('user'), cancelBooking);

// Technician (static routes before the :id param route)
router.get('/assigned', technicianOnly, getAssignedBookings);
router.get('/technician/summary', technicianOnly, getTechnicianSummary);
router.patch('/:id/accept', technicianOnly, acceptBooking);
router.patch('/:id/start', technicianOnly, startBooking);
router.patch('/:id/complete', technicianOnly, completeBooking);

// Admin
router.get('/', adminOnly, getAllBookings);
router.patch('/:id/assign', adminOnly, assignTechnician);

// Shared detail view (owner / assigned technician / admin — enforced in controller)
router.get('/:id', getBooking);

export default router;
