import Gig from '../models/Gig.js';
import { convertToINR } from '../utils/exchangeRate.js';

export const getGigs = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'open' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGig = async (req, res) => {
  try {
    const { title, description, budget, currency } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const inputCurrency = currency || 'USD';
    const budgetInINR = await convertToINR(budget, inputCurrency);

    const gig = await Gig.create({
      title,
      description,
      budget: budgetInINR,
      budgetInINR,
      originalCurrency: inputCurrency,
      ownerId: req.user._id,
    });

    const populatedGig = await Gig.findById(gig._id).populate('ownerId', 'name email phone');

    res.status(201).json(populatedGig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email phone location');

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
