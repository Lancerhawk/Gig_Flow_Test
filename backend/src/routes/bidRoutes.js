import express from 'express';
import { createBid, getBidsByGig, getUserBid, getMyBids } from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBid);
router.get('/user/my-bids', protect, getMyBids);
router.get('/user/:gigId', protect, getUserBid);
router.get('/:gigId', protect, getBidsByGig);

export default router;
