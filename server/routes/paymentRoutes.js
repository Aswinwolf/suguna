import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getAllPayments,
  getMyPayments,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/my', getMyPayments);
router.get('/', adminOnly, getAllPayments);

export default router;
