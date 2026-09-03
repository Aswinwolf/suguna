import express from 'express';
import {
  getServiceCategories,
  getServiceCategory,
  createServiceCategory,
  updateServiceCategory,
  toggleServiceCategory,
  deleteServiceCategory,
} from '../controllers/serviceCategoryController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';
import { validate, serviceCategoryRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public browsing (optionalAuth lets admins pass ?all=true to include inactive).
router.get('/', optionalAuth, getServiceCategories);
router.get('/:id', getServiceCategory);

// Admin management.
router.post('/', protect, adminOnly, serviceCategoryRules, validate, createServiceCategory);
router.put('/:id', protect, adminOnly, updateServiceCategory);
router.patch('/:id/toggle', protect, adminOnly, toggleServiceCategory);
router.delete('/:id', protect, adminOnly, deleteServiceCategory);

export default router;
