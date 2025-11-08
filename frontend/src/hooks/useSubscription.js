import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient.js';

export const useSubscription = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [subscription, setSubscription] = useState({
    isActive: false,
    planType: 'free',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated || !user) {
        setSubscription({ isActive: false, planType: 'free' });
        setLoading(false);
        return;
      }

      // Admin users automatically have access to all features
      if (user.role === 'admin') {
        setSubscription({ isActive: true, planType: 'admin' });
        setLoading(false);
        return;
      }

      try {
        const response = await axiosClient.get('/payment/subscription-status');
        setSubscription(response.data.subscription || { isActive: false, planType: 'free' });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription({ isActive: false, planType: 'free' });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, user]);

  // Admin users or users with active subscription have access
  const hasAccess = user?.role === 'admin' || subscription.isActive === true;

  return {
    subscription,
    hasAccess,
    loading,
  };
};

