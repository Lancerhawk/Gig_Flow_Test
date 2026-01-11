import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { completeOnboarding } from '../controllers/onboardingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.patch('/onboarding', protect, completeOnboarding);

export default router;
