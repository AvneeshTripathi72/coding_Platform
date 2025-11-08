import User from '../models/user.js';

// Middleware to check if user has active subscription
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

    // Admin users have access to all features
    if (user.role === 'admin') {
      return next();
    }

    // Check if subscription is active and not expired
    if (user.subscription?.isActive && user.subscription?.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(user.subscription.expiryDate);
      
      if (now <= expiryDate) {
        // Subscription is active
        return next();
      } else {
        // Subscription expired
        user.subscription.isActive = false;
        await user.save();
      }
    }

    // User doesn't have active subscription
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

