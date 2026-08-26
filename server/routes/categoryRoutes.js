import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validate, categoryRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, categoryRules, validate, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
