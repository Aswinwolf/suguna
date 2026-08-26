import express from 'express';
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/subCategoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validate, subCategoryRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', getSubCategories);
router.post('/', protect, adminOnly, subCategoryRules, validate, createSubCategory);
router.put('/:id', protect, adminOnly, updateSubCategory);
router.delete('/:id', protect, adminOnly, deleteSubCategory);

export default router;
