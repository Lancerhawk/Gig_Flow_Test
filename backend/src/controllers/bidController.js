import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { convertToINR } from '../utils/exchangeRate.js';

export const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || !price) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is not open for bidding' });
    }

    const priceInINR = await convertToINR(price, gig.originalCurrency || 'USD');

    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    });

    let bid;
    if (existingBid) {
      existingBid.message = message;
      existingBid.price = priceInINR;
      existingBid.priceInINR = priceInINR;
      existingBid.status = 'pending';
      await existingBid.save();
      bid = existingBid;
    } else {
      bid = await Bid.create({
        gigId,
        freelancerId: req.user._id,
        message,
        price: priceInINR,
        priceInINR,
      });
    }

    const populatedBid = await Bid.findById(bid._id)
      .populate('gigId', 'title description budget budgetInINR originalCurrency status')
      .populate('freelancerId', 'name email phone location');

    const io = req.app.locals.io;
    if (io) {
      io.emit('new-bid', {
        bidId: bid._id.toString(),
        gigId: gig._id.toString(),
        freelancerId: bid.freelancerId.toString(),
        gigOwnerId: gig.ownerId.toString(),
      });
    }

    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBidsByGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBid = async (req, res) => {
  try {
    const { gigId } = req.params;

    const bid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    })
      .populate('gigId', 'title description budget budgetInINR originalCurrency status')
      .populate('freelancerId', 'name email phone location');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId', 'title description budget budgetInINR originalCurrency status ownerId')
      .populate('gigId.ownerId', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
