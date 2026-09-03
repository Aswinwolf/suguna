import express from 'express';
import {
  getInvoiceByBooking,
  getMyInvoices,
  getAllInvoices,
} from '../controllers/invoiceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyInvoices);
router.get('/booking/:bookingId', getInvoiceByBooking);
router.get('/', adminOnly, getAllInvoices);

export default router;
