import axios from 'axios';
import { SUBSCRIPTION_PLANS, getDodoClient } from '../config/dodoPayments.js';
import Payment from '../models/payment.js';
import User from '../models/user.js';

const dodoApi = axios.create({
  baseURL:  'https://app.dodopayments.com/api',
  headers: {
    Authorization: `Bearer ${process.env.DODO_API_KEY}`,
    "Content-Type": "application/json"
  }
});

const cleanEnvId = (val) => {
  if (!val) return '';
  return String(val).split('#')[0].trim();
};

const isValidProductId = (possiblyId) => {
  const trimmed = cleanEnvId(possiblyId);
  if (!trimmed || trimmed.length < 6) return false;
  const lower = trimmed.toLowerCase();
  const invalid = new Set(['xxxx', 'your_product_id', 'your_product_id_here', 'prod_xxx', 'product_id']);
  return !invalid.has(lower);
};

export const createOrder = async (req, res) => {
  try {
    const { planType, email, name } = req.body;

    if (!planType || !SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const userId = req.user?._id || null;
    const userEmail = userId ? req.user.emailId : (email || '').trim();
    const userName = userId ? (req.user.firstName || req.user.name) : (name || '').trim();

    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    const amount = plan.amount;
    const currency = plan.currency || 'INR';

    const monthlyProductRaw = cleanEnvId(process.env.DODO_PRODUCT_MONTHLY_ID);
    const yearlyProductRaw = cleanEnvId(process.env.DODO_PRODUCT_YEARLY_ID);
    const monthlyProduct = isValidProductId(monthlyProductRaw) ? monthlyProductRaw : null;
    const yearlyProduct = isValidProductId(yearlyProductRaw) ? yearlyProductRaw : null;

    let requestData;

    if ((planType === 'monthly' && monthlyProduct) || (planType === 'yearly' && yearlyProduct)) {

      requestData = {
        product_cart: [{
          product_id: planType === 'monthly' ? monthlyProduct : yearlyProduct,
          quantity: 1
        }],
        customer: { email: userEmail, name: userName },
        return_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        metadata: { userId: userId || 'guest', planType, planName: plan.name }
      };

      const client = getDodoClient();

      try {
        console.log('Dodo checkoutSessions.create → request', {
          product_cart: requestData.product_cart,
          customer: { email: userEmail, name: userName },
          return_url: requestData.return_url,
          metadata: requestData.metadata
        });
      } catch (_) {}
      const response = await client.checkoutSessions.create(requestData);

      try {
        console.log('Dodo checkoutSessions.create ← response', {
          id: response?.id || response?.session_id,
          status: response?.status,
          url: response?.url || response?.checkout_url
        });
      } catch (_) {}

      const sessionId = response?.session_id || response?.id;
      const checkoutUrl = response?.checkout_url || response?.url;

      await Payment.create({
        userId: userId,
        dodoSessionId: sessionId,
        amount,
        currency,
        planType,
        status: 'pending'
      });

      return res.json({
        message: 'Checkout session created',
        sessionId,
        checkoutUrl,
        amount,
        currency,
        planType
      });

    } else {

      return res.status(400).json({
        message: 'Missing product configuration',
        error: 'Set DODO_PRODUCT_MONTHLY_ID and DODO_PRODUCT_YEARLY_ID in .env to enable checkout.'
      });
    }

  } catch (error) {
    console.error(error.details || error.response?.data || error);
    const reason = error.details?.responseData?.message || error.details?.message || error.message || 'Unknown error';
    res.status(500).json({ message: 'Payment create failed', error: reason });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return   res.status(400).json({ message: 'Session ID required' });

    try {
      const key = process.env.DODO_API_KEY || process.env.DODO_PAYMENTS_API_KEY || '';
      const keyMode = key.startsWith('sk_test') ? 'test' : key.startsWith('sk_live') ? 'live' : 'unknown';
      console.log('Verify request →', {
        session_id,
        env: process.env.DODO_ENV,
        keyMode
      });
    } catch (_) {}

    const existing = await Payment.findOne({ dodoSessionId: session_id });
    if (existing && existing.status === 'completed') {
      const userIdFromToken = req.user?._id;
      if (userIdFromToken) {
        const userDoc = await User.findById(userIdFromToken);
        if (userDoc) {
          const plan = SUBSCRIPTION_PLANS[existing.planType];
          const now = new Date();
          const expiry = new Date(now.getTime() + plan.duration * 86400000);
          userDoc.subscription = {
            isActive: true,
            planType: existing.planType,
            startDate: now,
            expiryDate: expiry
          };
          await userDoc.save();
          return res.json({ message: 'Subscription activated', subscription: userDoc.subscription });
        }
      }
      return res.json({ message: 'Payment verified (guest)' });
    }

    let s;
    try {
      const client = getDodoClient();
      const sessionResp = await client.checkoutSessions.retrieve(session_id);
      s = sessionResp?.data ?? sessionResp;
    } catch (e) {
      const status = e?.status || e?.response?.status;
      const details = e?.message || e?.response?.data || 'Unknown';
      if (status === 404) {
        return res.status(400).json({ message: 'Session not found or environment mismatch', received_session_id: session_id, details });
      }
      if (status === 400) {
        return res.status(400).json({ message: 'Invalid session for verification', received_session_id: session_id, details });
      }
      console.error('Verify retrieve error:', e);
      return res.status(500).json({ message: 'Verify failed', error: details });
    }

    const rawStatus = String(
      s?.status ??
      s?.payment_status ??
      s?.state ??
      s?.checkout_status ??
      ''
    ).toLowerCase();
    const isCompleted =
      s?.is_completed === true ||
      ['completed', 'succeeded', 'paid', 'success'].includes(rawStatus);
    if (!isCompleted) {
      return res.status(400).json({ message: 'Payment not completed', status: rawStatus });
    }

    let payment = await Payment.findOne({ dodoSessionId: session_id });
    
    const paymentAmount = s?.amount || s?.amount_total || s?.total_amount || 0;
    const paymentCurrency = s?.currency || s?.currency_code || 'INR';
    const paymentId = s?.payment_id || s?.payment_intent_id || s?.id || null;
    const metadata = s?.metadata || {};
    const planType = metadata.planType || payment?.planType || 'monthly';
    
    if (!payment) {
      payment = await Payment.create({
        userId: req.user?._id || null,
        dodoSessionId: session_id,
        dodoPaymentId: paymentId,
        amount: paymentAmount > 0 ? paymentAmount : (SUBSCRIPTION_PLANS[planType]?.amount || 0),
        currency: paymentCurrency,
        planType: planType,
        status: 'completed',
        metadata: {
          email: metadata.email || req.user?.emailId || '',
          name: metadata.name || req.user?.firstName || req.user?.name || '',
          isGuest: !req.user?._id
        }
      });
    } else {

      payment.status = 'completed';
      if (paymentId && !payment.dodoPaymentId) {
        payment.dodoPaymentId = paymentId;
      }
      if (paymentAmount > 0 && payment.amount !== paymentAmount) {
        payment.amount = paymentAmount;
      }
      if (paymentCurrency && payment.currency !== paymentCurrency) {
        payment.currency = paymentCurrency;
      }
      await payment.save();
    }

    const userId = req.user?._id;
    if (!userId) return res.json({ message: 'Payment verified (guest)', payment: { sessionId: session_id, status: 'completed' } });

    const user = await User.findById(userId);
    const plan = SUBSCRIPTION_PLANS[payment.planType];
    const now = new Date();
    const expiry = new Date(now.getTime() + plan.duration * 86400000);

    user.subscription = {
      isActive: true,
      planType: payment.planType,
      startDate: now,
      expiryDate: expiry
    };

    await user.save();

    res.json({ message: 'Subscription activated', subscription: user.subscription });

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: 'Verify failed', error: error.message });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  try {

    const rawBody =
      Buffer.isBuffer(req.body) ? req.body.toString('utf8') :
      typeof req.body === 'string' ? req.body :
      JSON.stringify(req.body || {});

    const secret =
      process.env.DODO_PAYMENTS_WEBHOOK_SECRET ||
      process.env.DODO_WEBHOOK_KEY ||
      '';
    let payload;
    if (secret) {
      try {
        const { default: WebhookModule } = await import('standardwebhooks').catch(() => ({ default: null }));
        const Webhook = WebhookModule || (await import('standardwebhooks')).Webhook;
        const verifier = new Webhook(secret);
        const headers = {
          'webhook-id': req.get('webhook-id') || '',
          'webhook-signature': req.get('webhook-signature') || '',
          'webhook-timestamp': req.get('webhook-timestamp') || ''
        };
        await verifier.verify(rawBody, headers);
        payload = JSON.parse(rawBody);
      } catch (verErr) {
        console.error('Webhook signature verification failed:', verErr?.message || verErr);

        try { payload = JSON.parse(rawBody); } catch { payload = {}; }
      }
    } else {
      try { payload = JSON.parse(rawBody); } catch { payload = {}; }
    }

    const body = payload || {};

    const type = body.type || body.event || body.event_type || '';
    const data = body.data || body.event?.data || body.payload || body.object || body;
    const sessionId =
      data.session_id ||
      data.id ||
      body.session_id ||
      body.id;
    const statusStr = String(
      data.status ||
      data.payment_status ||
      data.state ||
      data.checkout_status ||
      ''
    ).toLowerCase();
    const isCompleted =
      data.is_completed === true ||
      ['completed', 'succeeded', 'paid', 'success'].includes(statusStr);

    if (type === 'checkout.session.completed' || isCompleted) {
      if (!sessionId) {
        console.warn('Webhook completed event missing session_id');
      } else {

        const paymentAmount = data.amount || data.amount_total || data.total_amount || 0;
        const paymentCurrency = data.currency || data.currency_code || 'INR';
        const paymentId = data.payment_id || data.payment_intent_id || data.id || null;
        const metadata = data.metadata || {};
        const planType = metadata.planType || 'monthly';
        const userIdFromMeta = metadata.userId || null;
        
        let payment = await Payment.findOne({ dodoSessionId: sessionId });
        
        if (!payment) {

          payment = await Payment.create({
            userId: userIdFromMeta || null,
            dodoSessionId: sessionId,
            dodoPaymentId: paymentId,
            amount: paymentAmount > 0 ? paymentAmount : (SUBSCRIPTION_PLANS[planType]?.amount || 0),
            currency: paymentCurrency,
            planType: planType,
            status: 'completed',
            metadata: {
              email: metadata.email || data.customer?.email || '',
              name: metadata.name || data.customer?.name || '',
              isGuest: !userIdFromMeta
            }
          });
        } else {

          payment.status = 'completed';
          if (paymentId && !payment.dodoPaymentId) {
            payment.dodoPaymentId = paymentId;
          }
          if (paymentAmount > 0 && payment.amount !== paymentAmount) {
            payment.amount = paymentAmount;
          }
          if (paymentCurrency && payment.currency !== paymentCurrency) {
            payment.currency = paymentCurrency;
          }
          if (userIdFromMeta && !payment.userId) {
            payment.userId = userIdFromMeta;
          }
          if (metadata.email || metadata.name) {
            payment.metadata = {
              ...payment.metadata,
              email: metadata.email || payment.metadata?.email || '',
              name: metadata.name || payment.metadata?.name || '',
              isGuest: !userIdFromMeta
            };
          }
          await payment.save();
        }
        
        if (payment.userId) {
          const user = await User.findById(payment.userId);
          if (user) {
            const plan = SUBSCRIPTION_PLANS[payment.planType];
            const now = new Date();
            const expiry = new Date(now.getTime() + plan.duration * 86400000);
            user.subscription = {
              isActive: true,
              planType: payment.planType,
              startDate: now,
              expiryDate: expiry
            };
            await user.save();
          }
        }
      }
    }

    if (type && type.startsWith('subscription.')) {
      const meta = data.metadata || {};
      const planType = meta.planType || 'monthly';
      const userIdMeta = meta.userId || null;
      if (userIdMeta) {
        const user = await User.findById(userIdMeta);
        if (user) {
          if (type === 'subscription.active' || type === 'subscription.renewed') {
            const plan = SUBSCRIPTION_PLANS[planType];
            const now = new Date();
            const expiry = new Date(now.getTime() + plan.duration * 86400000);
            user.subscription = {
              isActive: true,
              planType,
              startDate: now,
              expiryDate: expiry
            };
          } else if (type === 'subscription.on_hold' || type === 'subscription.failed') {
            user.subscription = {
              ...user.subscription,
              isActive: false
            };
          }
          await user.save();
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ received: true });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('subscription role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.json({ 
        subscription: {
          isActive: true,
          planType: 'admin',
          startDate: null,
          expiryDate: null
        }
      });
    }

    return res.json({ subscription: user.subscription });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch subscription status', error: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return res.json({ payments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};

export const getPlans = (req, res) => {
  try {

    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      key,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency || 'INR',
      durationDays: plan.duration
    }));
    return res.json({ plans });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch plans', error: error.message });
  }
};
