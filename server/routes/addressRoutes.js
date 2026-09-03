import express from 'express';
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, addressRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyAddresses);
router.post('/', addressRules, validate, addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
