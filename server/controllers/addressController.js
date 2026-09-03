import asyncHandler from '../utils/asyncHandler.js';
import Address from '../models/Address.js';
import { enforceServiceArea } from '../utils/serviceArea.js';

const ADDRESS_FIELDS = [
  'fullName',
  'mobile',
  'houseNo',
  'street',
  'area',
  'city',
  'state',
  'pincode',
  'landmark',
  'addressType',
];

const pickAddressFields = (body) =>
  ADDRESS_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

// GET /api/addresses — current user's addresses, default first.
export const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  res.json(addresses);
});

// POST /api/addresses
export const addAddress = asyncHandler(async (req, res) => {
  // Force Erode/Tamil Nadu and validate the pincode is in the service area.
  const area = enforceServiceArea(pickAddressFields(req.body));
  if (!area.ok) {
    return res.status(400).json({ success: false, message: area.message });
  }
  const data = area.data;
  const existingCount = await Address.countDocuments({ user: req.user._id });

  // First address is always default; otherwise honour the requested flag.
  const makeDefault = existingCount === 0 || Boolean(req.body.isDefault);

  if (makeDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    ...data,
    user: req.user._id,
    isDefault: makeDefault,
  });

  res.status(201).json(address);
});

// PUT /api/addresses/:id
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  const fields = pickAddressFields(req.body);
  // Validate pincode against the service area when it is being changed.
  const nextPincode = fields.pincode !== undefined ? fields.pincode : address.pincode;
  const area = enforceServiceArea({ ...fields, pincode: nextPincode });
  if (!area.ok) {
    return res.status(400).json({ success: false, message: area.message });
  }
  Object.assign(address, area.data);

  if (req.body.isDefault === true && !address.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
  }

  const updated = await address.save();
  res.json(updated);
});

// DELETE /api/addresses/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  const wasDefault = address.isDefault;
  await address.deleteOne();

  // Promote the most recent remaining address to default.
  if (wasDefault) {
    const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  res.json({ success: true, message: 'Address removed' });
});

// PATCH /api/addresses/:id/default
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.json(address);
});
