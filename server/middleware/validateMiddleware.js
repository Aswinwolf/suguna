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
