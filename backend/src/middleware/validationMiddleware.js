import validator from 'validator';
import { SUBSCRIPTION_PLANS } from '../config/dodoPayments.js';

const respond = (res, code, message, extras = {}) =>
	res.status(code).json({ message, ...extras });

export const validateCreateOrder = (req, res, next) => {
	try {
		const { planType, email, name } = req.body || {};
		// planType is always required and must be supported
		if (!planType || !SUBSCRIPTION_PLANS[planType]) {
			return respond(res, 400, 'Invalid plan type');
		}
		// If user is not authenticated, require guest email and name
		const isGuest = !req.user;
		if (isGuest) {
			if (!email || !validator.isEmail(String(email).trim())) {
				return respond(res, 400, 'Valid email is required for guest checkout');
			}
			if (!name || String(name).trim().length < 2) {
				return respond(res, 400, 'Name must be at least 2 characters');
			}
		}
		// Basic sanitation
		if (typeof req.body?.email === 'string') req.body.email = req.body.email.trim();
		if (typeof req.body?.name === 'string') req.body.name = req.body.name.trim();
		req.body.planType = planType; // ensure normalized
		return next();
	} catch (err) {
		return respond(res, 400, 'Invalid request body', { error: err.message });
	}
};

export const validateVerifyPayment = (req, res, next) => {
	try {
		const { session_id } = req.body || {};
		if (!session_id || typeof session_id !== 'string' || !session_id.trim()) {
			return respond(res, 400, 'Session ID required');
		}
		req.body.session_id = session_id.trim();
		return next();
	} catch (err) {
		return respond(res, 400, 'Invalid request body', { error: err.message });
	}
};


