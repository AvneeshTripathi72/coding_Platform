import DodoPayments from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

export const DODO_PAYMENTS_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const API_KEY = process.env.DODO_API_KEY || process.env.DODO_PAYMENTS_API_KEY;
const ENVIRONMENT = process.env.DODO_ENV || 'live_mode'; // or 'test_mode'

let clientSingleton = null;
export function getDodoClient() {
  if (!clientSingleton) {
    clientSingleton = new DodoPayments({
      bearerToken: API_KEY,
      environment: ENVIRONMENT,
      // Explicitly null to avoid "Ambiguous URL" if DODO_PAYMENTS_BASE_URL is present
      baseURL: null,
    });
    console.log('DodoPayments SDK initialized successfully');
  }
  return clientSingleton;
}

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Premium',
    amount: 29900, // ₹299.00 in smallest currency unit
    amountDisplay: 299.00,
    currency: 'INR',
    duration: 30, // days
    description: 'Access to Editorial videos and Algorithm Visualizations for 30 days',
  },
  yearly: {
    name: 'Yearly Premium',
    amount: 299000, // ₹2990.00 in smallest currency unit (save ~17%)
    amountDisplay: 2990.00,
    currency: 'INR',
    duration: 365, // days
    description: 'Access to Editorial videos and Algorithm Visualizations for 1 year',
  },
};

// No duplicate exports
