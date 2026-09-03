import asyncHandler from '../utils/asyncHandler.js';
import RepairService from '../models/RepairService.js';

// GET /api/repair-services  — active list (optionally ?category=<id>, ?all=true for admin)
export const getRepairServices = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const filter = {};
  if (!(isAdmin && req.query.all === 'true')) filter.isActive = true;
  if (req.query.category) {
    // Match category-specific rows plus global (null) rows.
    filter.$or = [{ serviceCategory: req.query.category }, { serviceCategory: null }];
  }
  const services = await RepairService.find(filter)
    .populate('serviceCategory', 'name')
    .sort({ createdAt: -1 });
  res.json(services);
});

// POST /api/repair-services  (admin)
export const createRepairService = asyncHandler(async (req, res) => {
  const { name, charge, serviceCategory } = req.body;
  const service = await RepairService.create({
    name: name.trim(),
    charge,
    serviceCategory: serviceCategory || null,
  });
  res.status(201).json(service);
});

// PUT /api/repair-services/:id  (admin)
export const updateRepairService = asyncHandler(async (req, res) => {
  const service = await RepairService.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Repair service not found' });
  }
  const { name, charge, serviceCategory, isActive } = req.body;
  if (name !== undefined) service.name = name.trim();
  if (charge !== undefined) service.charge = charge;
  if (serviceCategory !== undefined) service.serviceCategory = serviceCategory || null;
  if (isActive !== undefined) service.isActive = isActive;
  const updated = await service.save();
  res.json(updated);
});

// DELETE /api/repair-services/:id  (admin)
export const deleteRepairService = asyncHandler(async (req, res) => {
  const service = await RepairService.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Repair service not found' });
  }
  await service.deleteOne();
  res.json({ success: true, message: 'Repair service removed' });
});
