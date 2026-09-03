import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import ServiceBooking from '../models/ServiceBooking.js';

// GET /api/technicians  (admin) — list technicians with live job counts
export const getTechnicians = asyncHandler(async (req, res) => {
  const technicians = await User.find({ role: 'technician' })
    .select('-password')
    .sort({ createdAt: -1 });

  // Attach active/completed job counts per technician.
  const withStats = await Promise.all(
    technicians.map(async (t) => {
      const [active, completed] = await Promise.all([
        ServiceBooking.countDocuments({
          technician: t._id,
          status: { $in: ['Assigned', 'Accepted', 'In Progress'] },
        }),
        ServiceBooking.countDocuments({ technician: t._id, status: 'Completed' }),
      ]);
      return { ...t.toObject(), activeJobs: active, completedJobs: completed };
    })
  );

  res.json(withStats);
});

// POST /api/technicians  (admin) — create a technician account
export const createTechnician = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specializations } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const technician = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'technician',
    phone,
    specializations: Array.isArray(specializations) ? specializations.filter(Boolean) : [],
  });

  res.status(201).json({
    _id: technician._id,
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    specializations: technician.specializations,
    isActive: technician.isActive,
    role: technician.role,
  });
});

// PUT /api/technicians/:id  (admin)
export const updateTechnician = asyncHandler(async (req, res) => {
  const technician = await User.findOne({ _id: req.params.id, role: 'technician' });
  if (!technician) {
    return res.status(404).json({ success: false, message: 'Technician not found' });
  }

  const { name, phone, specializations, isActive, password } = req.body;
  if (name !== undefined) technician.name = name;
  if (phone !== undefined) technician.phone = phone;
  if (specializations !== undefined) {
    technician.specializations = Array.isArray(specializations) ? specializations.filter(Boolean) : [];
  }
  if (isActive !== undefined) technician.isActive = isActive;
  if (password) technician.password = password; // re-hashed by the pre-save hook

  const updated = await technician.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    specializations: updated.specializations,
    isActive: updated.isActive,
    role: updated.role,
  });
});

// DELETE /api/technicians/:id  (admin)
export const deleteTechnician = asyncHandler(async (req, res) => {
  const technician = await User.findOne({ _id: req.params.id, role: 'technician' });
  if (!technician) {
    return res.status(404).json({ success: false, message: 'Technician not found' });
  }

  const activeJobs = await ServiceBooking.countDocuments({
    technician: technician._id,
    status: { $in: ['Assigned', 'Accepted', 'In Progress'] },
  });
  if (activeJobs > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete a technician with active jobs. Deactivate them instead.',
    });
  }

  await technician.deleteOne();
  res.json({ success: true, message: 'Technician removed' });
});
