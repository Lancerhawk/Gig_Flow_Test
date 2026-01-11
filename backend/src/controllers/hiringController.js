import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

export const hireBid = async (req, res) => {
  const io = req.app.locals.io;

  try {
    const { bidId } = req.params;

    // Use findOneAndUpdate with atomic operations to prevent race conditions
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = await Gig.findById(bid.gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    const updatedGig = await Gig.findOneAndUpdate(
      {
        _id: bid.gigId,
        status: 'open',
      },
      {
        $set: { status: 'assigned' },
      },
      { new: true }
    );

    if (!updatedGig) {
      return res.status(400).json({ message: 'Gig is already assigned or not found' });
    }

    const updatedBid = await Bid.findOneAndUpdate(
      {
        _id: bidId,
        status: 'pending',
      },
      {
        $set: { status: 'hired' },
      },
      { new: true }
    );

    if (!updatedBid) {
      await Gig.findByIdAndUpdate(bid.gigId, { $set: { status: 'open' } });
      return res.status(400).json({ message: 'Bid is not in pending status or already processed' });
    }

    await Bid.updateMany(
      {
        gigId: bid.gigId,
        _id: { $ne: bidId },
        status: 'pending',
      },
      {
        $set: { status: 'rejected' },
      }
    );

    const populatedBid = await Bid.findById(bidId)
      .populate('gigId', 'title description budget budgetInINR originalCurrency status')
      .populate('freelancerId', 'name email phone location');

    if (io) {
      io.emit('bid-hired', {
        bidId: bid._id.toString(),
        gigId: gig._id.toString(),
        gigTitle: gig.title,
        freelancerId: bid.freelancerId.toString(),
      });
      
      io.emit('gig-updated', {
        gigId: gig._id.toString(),
        status: 'assigned',
        title: gig.title,
      });
      
      io.to(gig.ownerId.toString()).emit('hire-confirmed', {
        bidId: bid._id.toString(),
        gigId: gig._id.toString(),
        gigTitle: gig.title,
        freelancerId: bid.freelancerId.toString(),
      });
    }

    res.json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
