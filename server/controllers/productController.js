import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';

// GET /api/products?category=&subCategory=&search=
export const getProducts = asyncHandler(async (req, res) => {
  const { category, subCategory, search } = req.query;
  const filter = {};

  if (category) filter.categoryId = category;
  if (subCategory) filter.subCategoryId = subCategory;
  if (search) filter.productName = { $regex: search, $options: 'i' };

  const products = await Product.find(filter)
    .populate('categoryId', 'categoryName')
    .populate('subCategoryId', 'subCategoryName')
    .sort({ createdAt: -1 });

  res.json(products);
});

// GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('categoryId', 'categoryName')
    .populate('subCategoryId', 'subCategoryName');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const { productName, productCode, categoryId, subCategoryId, brand, mrp, price, description, image } = req.body;

  const exists = await Product.findOne({ productCode: productCode.toUpperCase() });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Product code already exists' });
  }

  const product = await Product.create({
    productName,
    productCode,
    categoryId,
    subCategoryId,
    brand,
    mrp,
    price,
    description,
    image,
  });

  const populated = await product.populate([
    { path: 'categoryId', select: 'categoryName' },
    { path: 'subCategoryId', select: 'subCategoryName' },
  ]);

  res.status(201).json(populated);
});

// PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const fields = ['productName', 'productCode', 'categoryId', 'subCategoryId', 'brand', 'mrp', 'price', 'description', 'image'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  const updated = await product.save();
  const populated = await updated.populate([
    { path: 'categoryId', select: 'categoryName' },
    { path: 'subCategoryId', select: 'subCategoryName' },
  ]);
  res.json(populated);
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});
