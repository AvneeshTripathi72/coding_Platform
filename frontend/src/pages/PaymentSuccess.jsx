import { CheckCircle, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient.js';
import { checkAuth } from '../authslice.js';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [wasNewUser, setWasNewUser] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {

      const sessionId =
        searchParams.get('session_id') ||
        sessionStorage.getItem('dodo_session_id');
      
      if (!sessionId) {
        setStatus('error');
        setMessage('No session ID found');
        return;
      }

      try {

        const storedSessionId = sessionStorage.getItem('dodo_session_id');
        const storedPlanType = sessionStorage.getItem('dodo_plan_type');
        const storedGuestInfo = sessionStorage.getItem('dodo_guest_info');

        const verifyData = {
          session_id: sessionId,
          ...(storedPlanType && { planType: storedPlanType }),
          ...(storedGuestInfo && JSON.parse(storedGuestInfo)),
        };

        const response = await axiosClient.post('/payment/verify', verifyData);

        if (response.data.wasNewUser) {
          setWasNewUser(true);

          await dispatch(checkAuth());
        }

        sessionStorage.removeItem('dodo_session_id');
        sessionStorage.removeItem('dodo_plan_type');
        sessionStorage.removeItem('dodo_guest_info');

        setStatus('success');
        setMessage('Payment successful! Your subscription is now active.');

        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader className="w-16 h-16 text-yellow-400 mx-auto animate-spin" />
            <h2 className="text-2xl font-bold text-white">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
            <p className="text-white/70">{message}</p>
            {wasNewUser && (
              <p className="text-yellow-400 text-sm mt-2">
                Your account has been created. You can now log in with your credentials.
              </p>
            )}
            <p className="text-white/50 text-sm mt-4">Redirecting to home...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-400 text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Verification Failed</h2>
            <p className="text-white/70">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
