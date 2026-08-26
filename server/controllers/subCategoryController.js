import asyncHandler from '../utils/asyncHandler.js';
import SubCategory from '../models/SubCategory.js';
import Product from '../models/Product.js';

// GET /api/subcategories?categoryId=xxx
export const getSubCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;

  const subCategories = await SubCategory.find(filter)
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 });

  res.json(subCategories);
});

// POST /api/subcategories
export const createSubCategory = asyncHandler(async (req, res) => {
  const { subCategoryName, categoryId } = req.body;

  const exists = await SubCategory.findOne({ subCategoryName, categoryId });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'SubCategory with this name already exists in the selected category',
    });
  }

  const subCategory = await SubCategory.create({ subCategoryName, categoryId });
  const populated = await subCategory.populate('categoryId', 'categoryName');
  res.status(201).json(populated);
});

// PUT /api/subcategories/:id
export const updateSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return res.status(404).json({ success: false, message: 'SubCategory not found' });
  }

  subCategory.subCategoryName = req.body.subCategoryName || subCategory.subCategoryName;
  if (req.body.categoryId) subCategory.categoryId = req.body.categoryId;

  const updated = await subCategory.save();
  const populated = await updated.populate('categoryId', 'categoryName');
  res.json(populated);
});

// DELETE /api/subcategories/:id
export const deleteSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return res.status(404).json({ success: false, message: 'SubCategory not found' });
  }

  const linked = await Product.countDocuments({ subCategoryId: subCategory._id });
  if (linked > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete subcategory with existing products',
    });
  }

  await subCategory.deleteOne();
  res.json({ success: true, message: 'SubCategory removed' });
});
