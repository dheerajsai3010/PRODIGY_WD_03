import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import {
  buildProductQuery,
  calculateAverageRating,
  formatProductResponse,
} from '../utils/helpers.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg, statusCode: 400 });
  }
  next();
};

const paginateProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 12);
    const skip = (page - 1) * limit;
    const { filter, sort } = buildProductQuery(req.query);

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit) || 1;

    res.json({
      success: true,
      data: products.map(formatProductResponse),
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

router.get('/filter', paginateProducts);
router.get('/', paginateProducts);

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
    }

    product.views += 1;
    await product.save();

    const [reviews, relatedProducts] = await Promise.all([
      Review.find({ productId: product._id }).populate('userId', 'name').limit(5).sort({ createdAt: -1 }),
      Product.find({ category: product.category, _id: { $ne: product._id }, isActive: { $ne: false } }).limit(4),
    ]);

    res.json({
      success: true,
      data: {
        ...formatProductResponse(product),
        reviews,
        relatedProducts: relatedProducts.map(formatProductResponse),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  verifyToken,
  adminOnly,
  [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('price').isNumeric(),
    body('category').notEmpty(),
    body('stock').isNumeric(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({
        success: true,
        data: formatProductResponse(product),
        message: 'Product created',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
    }
    res.json({ success: true, data: formatProductResponse(product), message: 'Product updated' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
    }
    await Review.deleteMany({ productId: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reviews', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'newest';
    const ratingFilter = req.query.rating ? { rating: Number(req.query.rating) } : {};

    let sort = { createdAt: -1 };
    if (sortBy === 'helpful') sort = { helpful: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };

    const filter = { productId: req.params.id, ...ratingFilter };
    const [reviews, total, allReviews] = await Promise.all([
      Review.find(filter).populate('userId', 'name').sort(sort).skip(skip).limit(limit),
      Review.countDocuments(filter),
      Review.find({ productId: req.params.id }),
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    const totalReviews = allReviews.length;
    const pct = (n) => (totalReviews ? Math.round((n / totalReviews) * 100) : 0);

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        title: r.title,
        text: r.text,
        author: r.userId?.name || 'Anonymous',
        authorId: r.userId?._id,
        date: r.createdAt,
        images: r.images,
        verified: r.verified,
        helpful: { count: r.helpful, userVoted: false },
        unhelpful: { count: r.unhelpful, userVoted: false },
        sellerReply: r.sellerReply,
      })),
      summary: {
        avgRating: calculateAverageRating(allReviews),
        totalReviews,
        ratingDistribution: {
          5: pct(distribution[5]),
          4: pct(distribution[4]),
          3: pct(distribution[3]),
          2: pct(distribution[2]),
          1: pct(distribution[1]),
        },
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalReviews: total,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:id/reviews',
  verifyToken,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').isLength({ min: 5, max: 100 }),
    body('text').isLength({ min: 10, max: 500 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await Review.findOne({ productId: req.params.id, userId: req.user._id });
      if (existing) {
        return res.status(400).json({ success: false, error: 'You already reviewed this product', statusCode: 400 });
      }

      const review = await Review.create({
        productId: req.params.id,
        userId: req.user._id,
        rating: req.body.rating,
        title: req.body.title,
        text: req.body.text,
        images: req.body.images || [],
        verified: req.body.verified || false,
      });

      const allReviews = await Review.find({ productId: req.params.id });
      await Product.findByIdAndUpdate(req.params.id, {
        rating: calculateAverageRating(allReviews),
        reviewCount: allReviews.length,
      });

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review added',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id/reviews/:reviewId', verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found', statusCode: 404 });
    }
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized', statusCode: 403 });
    }

    await review.deleteOne();
    const allReviews = await Review.find({ productId: req.params.id });
    await Product.findByIdAndUpdate(req.params.id, {
      rating: calculateAverageRating(allReviews),
      reviewCount: allReviews.length,
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
