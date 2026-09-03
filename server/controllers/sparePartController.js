import asyncHandler from '../utils/asyncHandler.js';
import SparePart from '../models/SparePart.js';

// GET /api/spare-parts  — active list (optionally ?category=<id>, ?all=true for admin)
export const getSpareParts = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const filter = {};
  if (!(isAdmin && req.query.all === 'true')) filter.isActive = true;
  if (req.query.category) {
    filter.$or = [{ serviceCategory: req.query.category }, { serviceCategory: null }];
  }
  const parts = await SparePart.find(filter)
    .populate('serviceCategory', 'name')
    .sort({ createdAt: -1 });
  res.json(parts);
});

// POST /api/spare-parts  (admin)
export const createSparePart = asyncHandler(async (req, res) => {
  const { name, price, serviceCategory } = req.body;
  const part = await SparePart.create({
    name: name.trim(),
    price,
    serviceCategory: serviceCategory || null,
  });
  res.status(201).json(part);
});

// PUT /api/spare-parts/:id  (admin)
export const updateSparePart = asyncHandler(async (req, res) => {
  const part = await SparePart.findById(req.params.id);
  if (!part) {
    return res.status(404).json({ success: false, message: 'Spare part not found' });
  }
  const { name, price, serviceCategory, isActive } = req.body;
  if (name !== undefined) part.name = name.trim();
  if (price !== undefined) part.price = price;
  if (serviceCategory !== undefined) part.serviceCategory = serviceCategory || null;
  if (isActive !== undefined) part.isActive = isActive;
  const updated = await part.save();
  res.json(updated);
});

// DELETE /api/spare-parts/:id  (admin)
export const deleteSparePart = asyncHandler(async (req, res) => {
  const part = await SparePart.findById(req.params.id);
  if (!part) {
    return res.status(404).json({ success: false, message: 'Spare part not found' });
  }
  await part.deleteOne();
  res.json({ success: true, message: 'Spare part removed' });
});
