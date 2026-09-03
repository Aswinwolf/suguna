import express from 'express';
import {
  getSpareParts,
  createSparePart,
  updateSparePart,
  deleteSparePart,
} from '../controllers/sparePartController.js';
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';
import { validate, sparePartRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'technician'), getSpareParts);
router.post('/', protect, adminOnly, sparePartRules, validate, createSparePart);
router.put('/:id', protect, adminOnly, updateSparePart);
router.delete('/:id', protect, adminOnly, deleteSparePart);

export default router;
