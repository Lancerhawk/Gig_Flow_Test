import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
      min: 0,
    },
    budgetInINR: {
      type: Number,
      required: true,
      min: 0,
    },
    originalCurrency: {
      type: String,
      enum: ['USD', 'INR'],
      default: 'USD',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'assigned'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
