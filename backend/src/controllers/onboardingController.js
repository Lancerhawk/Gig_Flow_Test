import User from '../models/User.js';

export const completeOnboarding = async (req, res) => {
  try {
    const { phone, location, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        phone,
        location,
        bio,
        isOnboarded: true,
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
