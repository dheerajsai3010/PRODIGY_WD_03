import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
});

const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  name: String,
  email: String,
  phone: String,
  address: String,
  apartment: String,
  city: String,
  state: String,
  postalCode: String,
  country: { type: String, default: 'India' },
});

const statusTimelineSchema = new mongoose.Schema({
  status: String,
  message: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    subtotal: Number,
    tax: Number,
    shipping: Number,
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    transactionId: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    promoCode: String,
    statusTimeline: [statusTimelineSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
