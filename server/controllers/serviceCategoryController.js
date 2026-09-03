import asyncHandler from '../utils/asyncHandler.js';
import ServiceCategory from '../models/ServiceCategory.js';
import RepairService from '../models/RepairService.js';
import SparePart from '../models/SparePart.js';

// GET /api/service-categories
// Public list returns active categories only; admins can pass ?all=true.
export const getServiceCategories = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const filter = isAdmin && req.query.all === 'true' ? {} : { isActive: true };
  const categories = await ServiceCategory.find(filter).sort({ createdAt: -1 });
  res.json(categories);
});

// GET /api/service-categories/:id
export const getServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Service category not found' });
  }
  res.json(category);
});

// POST /api/service-categories  (admin)
export const createServiceCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image, visitingCharge, issues } = req.body;

  const exists = await ServiceCategory.findOne({ name: name.trim() });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Service category already exists' });
  }

  const category = await ServiceCategory.create({
    name: name.trim(),
    description,
    icon,
    image,
    visitingCharge: visitingCharge || 0,
    issues: Array.isArray(issues) ? issues.filter(Boolean) : [],
  });

  res.status(201).json(category);
});

// PUT /api/service-categories/:id  (admin)
export const updateServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Service category not found' });
  }

  const { name, description, icon, image, visitingCharge, issues, isActive } = req.body;
  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (image !== undefined) category.image = image;
  if (visitingCharge !== undefined) category.visitingCharge = visitingCharge;
  if (issues !== undefined) category.issues = Array.isArray(issues) ? issues.filter(Boolean) : [];
  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();
  res.json(updated);
});

// PATCH /api/service-categories/:id/toggle  (admin) — activate/deactivate
export const toggleServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Service category not found' });
  }
  category.isActive = !category.isActive;
  await category.save();
  res.json(category);
});

// DELETE /api/service-categories/:id  (admin)
export const deleteServiceCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Service category not found' });
  }

  // Detach masters scoped to this category rather than hard-blocking deletion.
  await RepairService.updateMany({ serviceCategory: category._id }, { serviceCategory: null });
  await SparePart.updateMany({ serviceCategory: category._id }, { serviceCategory: null });

  await category.deleteOne();
  res.json({ success: true, message: 'Service category removed' });
});
