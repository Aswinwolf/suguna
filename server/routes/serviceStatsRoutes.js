import express from 'express';
import { getServiceStats } from '../controllers/serviceStatsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getServiceStats);

export default router;
