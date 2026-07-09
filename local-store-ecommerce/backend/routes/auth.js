import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { validatePasswordStrength } from '../utils/helpers.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg, statusCode: 400 });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, phone } = req.body;
      const strength = validatePasswordStrength(password);
      if (!strength.valid) {
        return res.status(400).json({
          success: false,
          error: 'Password must include uppercase, lowercase, number, and special character',
          statusCode: 400,
        });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, error: 'Email already registered', statusCode: 400 });
      }

      const user = await User.create({ name, email, password, phone });
      const token = user.generateToken();

      res.status(201).json({
        success: true,
        data: {
          user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
          token,
        },
        message: 'Account created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, error: 'Invalid email or password', statusCode: 401 });
      }

      user.lastLogin = new Date();
      await user.save();
      const token = user.generateToken();

      res.json({
        success: true,
        data: {
          user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
          token,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    },
  });
});

router.post('/refresh-token', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const token = user.generateToken();
    res.json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', [body('email').isEmail()], validate, async (req, res) => {
  res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
});

router.post('/reset-password', async (req, res) => {
  res.json({ success: true, message: 'Password reset successful' });
});

export default router;
