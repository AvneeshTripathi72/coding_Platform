import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PaymentCancel() {
  const navigate = useNavigate();

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dodo_session_id');
    sessionStorage.removeItem('dodo_plan_type');
    sessionStorage.removeItem('dodo_guest_info');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h2>
        <p className="text-white/70 mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default PaymentCancel;
