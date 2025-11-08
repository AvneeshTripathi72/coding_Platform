import { Crown, Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient.js';

function PaymentModal({ isOpen, onClose, planType: initialPlanType = 'monthly' }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [planType, setPlanType] = useState(initialPlanType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const isGuest = !isAuthenticated || !user;
  
  useEffect(() => {
    if (isOpen) {
      console.log('PaymentModal - isGuest:', isGuest, 'isAuthenticated:', isAuthenticated, 'user:', user);
    }
  }, [isOpen, isGuest, isAuthenticated, user]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setGuestInfo({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [isOpen]);

  const isGuestFormValid = isGuest ? (
    guestInfo.email?.trim() &&
    guestInfo.email.includes('@') &&
    guestInfo.name?.trim() &&
    guestInfo.name.trim().length >= 2 &&
    guestInfo.password?.trim() &&
    guestInfo.password.length >= 6 &&
    guestInfo.password === guestInfo.confirmPassword
  ) : true;

  const plans = {
    monthly: {
      name: 'Monthly Premium',
      price: 299,
      duration: '30 days',
      description: 'Access to Editorial videos and Algorithm Visualizations',
    },
    yearly: {
      name: 'Yearly Premium',
      price: 2990,
      duration: '1 year',
      description: 'Access to Editorial videos and Algorithm Visualizations',
      savings: 'Save 17%',
    },
  };

  const validateGuestInfo = () => {
    if (!guestInfo.email || !guestInfo.email.trim()) {
      setError('Email is required for guest checkout');
      return false;
    }
    if (!guestInfo.email.includes('@') || !guestInfo.email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!guestInfo.name || guestInfo.name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      return false;
    }
    if (isGuest && (!guestInfo.password || guestInfo.password.length < 6)) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (isGuest && guestInfo.password !== guestInfo.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {

    setError('');
    
    if (isGuest) {

      if (!guestInfo.email || !guestInfo.email.trim()) {
        setError('Email is required for guest checkout');
        return;
      }
      
      if (!guestInfo.name || !guestInfo.name.trim()) {
        setError('Name is required for guest checkout');
        return;
      }
      
      if (!guestInfo.password || !guestInfo.password.trim()) {
        setError('Password is required for guest checkout');
        return;
      }
      
      if (!validateGuestInfo()) {
        return;
      }
    }

    setLoading(true);

    try {
      const orderData = {
        planType,
      };

      if (isGuest) {
        const trimmedEmail = guestInfo.email?.trim();
        const trimmedName = guestInfo.name?.trim();
        
        if (!trimmedEmail) {
          setError('Email is required for guest checkout');
          setLoading(false);
          return;
        }
        
        if (!trimmedName) {
          setError('Name is required for guest checkout');
          setLoading(false);
          return;
        }
        
        orderData.email = trimmedEmail;
        orderData.name = trimmedName;
      }

      const response = await axiosClient.post('/payment/create-order', orderData);
      
      if (response.data.checkoutUrl) {

        if (isGuest) {
          sessionStorage.setItem('dodo_session_id', response.data.sessionId);
          sessionStorage.setItem('dodo_plan_type', planType);
          sessionStorage.setItem('dodo_guest_info', JSON.stringify({
            email: guestInfo.email,
            name: guestInfo.name,
            password: guestInfo.password,
          }));
        }
        
        window.location.href = response.data.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);

      const errorMsg = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to initiate payment';
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-gray-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Premium Subscription</h2>
            </div>
            <button
              onClick={() => {
                setError('');
                onClose();
              }}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(plans).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setPlanType(key)}
                  className={`p-4 rounded-lg border-2 transition ${
                    planType === key
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-white font-semibold">{plan.name}</div>
                  <div className="text-2xl font-bold text-yellow-400 mt-2">
                    ₹{plan.price}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{plan.duration}</div>
                  {plan.savings && (
                    <div className="text-green-400 text-xs mt-1">{plan.savings}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {}
          {isGuest ? (
            <div className="mb-6 space-y-4">
              <div className="text-sm text-yellow-400 mb-2 font-semibold">
                Guest Checkout - Create your account during payment
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => {
                    setGuestInfo({ ...guestInfo, email: e.target.value });
                    setError('');
                  }}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={guestInfo.name}
                  onChange={(e) => {
                    setGuestInfo({ ...guestInfo, name: e.target.value });
                    setError('');
                  }}
                  placeholder="Your Name"
                  required
                  className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={guestInfo.password}
                  onChange={(e) => {
                    setGuestInfo({ ...guestInfo, password: e.target.value });
                    setError('');
                  }}
                  placeholder="Create password (min 6 characters)"
                  required
                  className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={guestInfo.confirmPassword}
                  onChange={(e) => {
                    setGuestInfo({ ...guestInfo, confirmPassword: e.target.value });
                    setError('');
                  }}
                  placeholder="Confirm password"
                  required
                  className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          ) : null}

          {}
          <div className="mb-6">
            <div className="text-gray-300 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span>Access to Editorial videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span>Algorithm Visualizations</span>
              </div>
            </div>
          </div>

          {}
          <button
            onClick={handlePayment}
            disabled={loading || (isGuest && !isGuestFormValid)}
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Subscribe for ₹${plans[planType].price}`}
          </button>
          
          {isGuest && !isGuestFormValid && (
            <p className="text-center text-red-400 text-xs mt-2">
              Please fill in all required fields above
            </p>
          )}

          <p className="text-center text-gray-400 text-xs mt-4">
            Secure payment powered by DodoPay
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
