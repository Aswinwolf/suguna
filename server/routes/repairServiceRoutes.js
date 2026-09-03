import express from 'express';
import {
  getRepairServices,
  createRepairService,
  updateRepairService,
  deleteRepairService,
} from '../controllers/repairServiceController.js';
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';
import { validate, repairServiceRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Technicians and admins read the master list; admins manage it.
router.get('/', protect, authorize('admin', 'technician'), getRepairServices);
router.post('/', protect, adminOnly, repairServiceRules, validate, createRepairService);
router.put('/:id', protect, adminOnly, updateRepairService);
router.delete('/:id', protect, adminOnly, deleteRepairService);

export default router;
