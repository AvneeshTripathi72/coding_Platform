import DodoPayments from 'dodopayments';
import dotenv from 'dotenv';
dotenv.config();

export const DODO_PAYMENTS_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const API_KEY = process.env.DODO_API_KEY || process.env.DODO_PAYMENTS_API_KEY;
const ENVIRONMENT = process.env.DODO_ENV || 'live_mode';

let clientSingleton = null;
export function getDodoClient() {
  if (!clientSingleton) {
    clientSingleton = new DodoPayments({
      bearerToken: API_KEY,
      environment: ENVIRONMENT,
      baseURL: null,
    });
    console.log('DodoPayments SDK initialized successfully');
  }
  return clientSingleton;
}

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Premium',
    amount: 29900,
    amountDisplay: 299.00,
    currency: 'INR',
    duration: 30,
    description: 'Access to Editorial videos and Algorithm Visualizations for 30 days',
  },
  yearly: {
    name: 'Yearly Premium',
    amount: 299000,
    amountDisplay: 2990.00,
    currency: 'INR',
    duration: 365,
    description: 'Access to Editorial videos and Algorithm Visualizations for 1 year',
  },
};
