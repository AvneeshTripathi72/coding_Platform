import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be null for guest payments
  },
  dodoSessionId: {
    type: String,
    required: true,
  },
  dodoPaymentId: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  planType: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  metadata: {
    email: String,
    name: String,
    isGuest: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

