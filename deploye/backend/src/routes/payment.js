import express from 'express';
import {
    createOrder,
    getPaymentHistory,
    getPlans,
    getSubscriptionStatus,
    handlePaymentWebhook,
    verifyPayment,
} from '../controllers/paymentController.js';
import { optionalAuthMiddleware, userMiddleware } from '../middleware/userMiddleware.js';
import { validateCreateOrder, validateVerifyPayment } from '../middleware/validationMiddleware.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', optionalAuthMiddleware, validateCreateOrder, createOrder);
paymentRouter.post('/verify', optionalAuthMiddleware, validateVerifyPayment, verifyPayment);

paymentRouter.post('/webhook', express.raw({ type: '*/*' }), handlePaymentWebhook);

paymentRouter.get('/subscription-status', userMiddleware, getSubscriptionStatus);
paymentRouter.get('/history', userMiddleware, getPaymentHistory);
paymentRouter.get('/plans', getPlans);

export default paymentRouter;
