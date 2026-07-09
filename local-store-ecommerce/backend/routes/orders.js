import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import {
  applyPromoCode,
  calculateDeliveryDate,
  calculateOrderTotals,
  generateTrackingNumber,
} from '../utils/helpers.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, promoCode } = req.body;
    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ success: false, error: 'Items and shipping address required', statusCode: 400 });
    }

    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, error: `Product not found: ${item.productId}`, statusCode: 400 });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `${product.name} has only ${product.stock} in stock`,
          statusCode: 400,
        });
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image || product.images?.[0],
        price: item.price || product.price,
        quantity: item.quantity,
      });
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const { subtotal, tax, shipping, total } = calculateOrderTotals(orderItems);
    const promo = promoCode ? applyPromoCode(promoCode, subtotal) : { valid: false, discount: 0 };
    const discount = promo.valid ? promo.discount : 0;
    const finalTotal = total - discount;

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      tax,
      shipping,
      discount,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'pending',
      trackingNumber: generateTrackingNumber(),
      estimatedDelivery: calculateDeliveryDate(7),
      promoCode: promo.valid ? promoCode : undefined,
      statusTimeline: [
        { status: 'pending', message: 'Order received', location: 'Warehouse' },
      ],
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        estimatedDelivery: order.estimatedDelivery,
        ...order.toObject(),
      },
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:userId', verifyToken, async (req, res, next) => {
  try {
    if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden', statusCode: 403 });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = { userId: req.params.userId };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalOrders: total },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/track/:orderId', verifyToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden', statusCode: 403 });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        currentStatus: order.status,
        timeline: order.statusTimeline,
        estimatedDelivery: order.estimatedDelivery,
        shippingAddress: order.shippingAddress,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:orderId', verifyToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden', statusCode: 403 });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

router.put('/:orderId/status', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }

    order.status = status;
    order.statusTimeline.push({
      status,
      message: `Order ${status.replace(/_/g, ' ')}`,
      location: status === 'shipped' ? 'Distribution Center' : 'Warehouse',
      timestamp: new Date(),
    });
    await order.save();

    res.json({ success: true, data: order, message: 'Order status updated' });
  } catch (error) {
    next(error);
  }
});

router.post('/:orderId/cancel', verifyToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', statusCode: 404 });
    }
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden', statusCode: 403 });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(409).json({ success: false, error: 'Order cannot be cancelled', statusCode: 409 });
    }

    order.status = 'cancelled';
    order.statusTimeline.push({ status: 'cancelled', message: 'Order cancelled by customer' });
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', refundAmount: order.totalAmount });
  } catch (error) {
    next(error);
  }
});

export default router;
