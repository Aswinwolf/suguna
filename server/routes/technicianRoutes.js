import express from 'express';
import {
  getTechnicians,
  createTechnician,
  updateTechnician,
  deleteTechnician,
} from '../controllers/technicianController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validate, technicianRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getTechnicians);
router.post('/', technicianRules, validate, createTechnician);
router.put('/:id', updateTechnician);
router.delete('/:id', deleteTechnician);

export default router;
