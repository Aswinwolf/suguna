import express from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, registerRules, loginRules } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);
router.get('/profile', protect, getProfile);

export default router;