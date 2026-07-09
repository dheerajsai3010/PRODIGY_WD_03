import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
    console.warn('Invalid RAZORPAY_KEY_ID prefix. Falling back to simulated dev payment mode.');
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

router.post('/create-order', verifyToken, async (req, res, next) => {
  try {
    const { orderId, amount, email, phone, customerName } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.statusTimeline.push({ status: 'confirmed', message: 'Payment simulated (dev mode)' });
      order.transactionId = `TXN${Date.now()}`;
      await order.save();
      return res.json({
        success: true,
        data: {
          devMode: true,
          orderId: order._id,
          amount: order.totalAmount,
          status: 'confirmed',
        },
        message: 'Payment simulated in development mode',
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: orderId,
      notes: { email, phone, customerName },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-payment', verifyToken, async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: 'Payment already verified', statusCode: 400 });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(401).json({ success: false, error: 'Invalid payment signature', statusCode: 401 });
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = razorpayPaymentId;
    order.transactionId = razorpayPaymentId;
    order.statusTimeline.push({ status: 'confirmed', message: 'Payment verified, order confirmed' });
    await order.save();

    res.json({
      success: true,
      data: { orderId: order._id, paymentId: razorpayPaymentId, status: 'confirmed' },
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/order/:orderId', verifyToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }
    res.json({
      success: true,
      data: {
        orderId: order._id,
        razorpayPaymentId: order.razorpayPaymentId,
        amount: order.totalAmount,
        status: order.paymentStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  res.json({ success: true });
});

export default router;
