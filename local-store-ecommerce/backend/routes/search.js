import express from 'express';
import Product from '../models/Product.js';
import { formatProductResponse } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    if (!q || q.length < 1) {
      return res.status(400).json({ success: false, error: 'Search query required', statusCode: 400 });
    }

    const regex = new RegExp(q, 'i');
    const products = await Product.find({
      isActive: { $ne: false },
      $or: [{ name: regex }, { description: regex }, { category: regex }, { brand: regex }],
    })
      .limit(limit)
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: products.map((p) => ({
        ...formatProductResponse(p),
        highlight: p.name,
      })),
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/autocomplete', async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    const limit = parseInt(req.query.limit, 10) || 8;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: { products: [], categories: [], recentSearches: [] } });
    }

    const regex = new RegExp(q, 'i');
    const [products, categoryAgg] = await Promise.all([
      Product.find({ name: regex, isActive: { $ne: false } }).limit(limit).select('name images image price category'),
      Product.aggregate([
        { $match: { category: regex, isActive: { $ne: false } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        products: products.map((p) => ({
          id: p._id,
          name: p.name,
          image: p.image || p.images?.[0],
          price: p.price,
          category: p.category,
        })),
        categories: categoryAgg.map((c) => ({ name: c._id, count: c.count })),
        recentSearches: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
