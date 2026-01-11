import express from 'express';
import { getGigs, createGig, getGig, getMyGigs } from '../controllers/gigController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/user/my-gigs', protect, getMyGigs);
router.get('/:id', getGig);
router.post('/', protect, createGig);

export default router;
