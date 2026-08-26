import asyncHandler from '../utils/asyncHandler.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import Product from '../models/Product.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  const exists = await Category.findOne({ categoryName: categoryName.trim() });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Category already exists' });
  }

  const category = await Category.create({ categoryName: categoryName.trim() });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  category.categoryName = req.body.categoryName ? req.body.categoryName.trim() : category.categoryName;
  const updated = await category.save();
  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const linkedProducts = await Product.countDocuments({ categoryId: category._id });
  const linkedSubCategories = await SubCategory.countDocuments({ categoryId: category._id });

  if (linkedProducts > 0 || linkedSubCategories > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with existing products',
    });
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category removed' });
});
