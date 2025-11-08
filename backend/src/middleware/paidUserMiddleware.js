import User from '../models/user.js';

export const checkPaidUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId).select('subscription role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return next();
    }

    if (user.subscription?.isActive && user.subscription?.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(user.subscription.expiryDate);
      
      if (now <= expiryDate) {

        return next();
      } else {

        user.subscription.isActive = false;
        await user.save();
      }
    }

    return res.status(403).json({ 
      message: 'Premium subscription required',
      hasAccess: false,
    });
  } catch (error) {
    console.error('Error checking paid user:', error);
    return res.status(500).json({ 
      message: 'Error checking subscription status', 
      error: error.message 
    });
  }
};
