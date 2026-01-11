import express from 'express';
import { hireBid } from '../controllers/hiringController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.patch('/:bidId/hire', protect, hireBid);

export default router;
