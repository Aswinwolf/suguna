import { body, validationResult } from 'express-validator';

/**
 * Collects express-validator results and returns a 400 with the first message.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const categoryRules = [
  body('categoryName').trim().notEmpty().withMessage('Category name is required'),
];

export const subCategoryRules = [
  body('subCategoryName').trim().notEmpty().withMessage('SubCategory name is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
];

export const productRules = [
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('productCode').trim().notEmpty().withMessage('Product code is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('subCategoryId').notEmpty().withMessage('SubCategory is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

// ------------------------- Service module rules -------------------------

export const addressRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('mobile').trim().matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('houseNo').trim().notEmpty().withMessage('House number is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
  // City/State are fixed to Erode/Tamil Nadu server-side, so not required here.
  body('pincode').trim().matches(/^638\d{3}$/).withMessage('We currently serve Erode only (pincode 638xxx)'),
  body('addressType').optional().isIn(['Home', 'Office']).withMessage('Invalid address type'),
];

export const serviceCategoryRules = [
  body('name').trim().notEmpty().withMessage('Service category name is required'),
  body('visitingCharge').optional().isFloat({ min: 0 }).withMessage('Visiting charge must be positive'),
];

export const repairServiceRules = [
  body('name').trim().notEmpty().withMessage('Repair service name is required'),
  body('charge').isFloat({ min: 0 }).withMessage('Charge must be a positive number'),
];

export const sparePartRules = [
  body('name').trim().notEmpty().withMessage('Spare part name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

export const technicianRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const bookingRules = [
  body('serviceCategory').notEmpty().withMessage('Service category is required'),
  body('issue').trim().notEmpty().withMessage('Issue type is required'),
  body('scheduledDate').notEmpty().withMessage('Date is required'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
];
