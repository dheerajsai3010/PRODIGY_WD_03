export const calculateAverageRating = (reviews) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

export const calculateOrderTotals = (items, promoDiscount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal > 500 ? 0 : 100;
  const total = Math.round((subtotal + tax + shipping - promoDiscount) * 100) / 100;
  return { subtotal, tax, shipping, total };
};

export const generateTrackingNumber = () =>
  `TRK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const calculateDeliveryDate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
  const valid = Object.values(checks).every(Boolean);
  return { valid, checks };
};

export const formatProductResponse = (product) => {
  const obj = product.toObject ? product.toObject() : product;
  return {
    ...obj,
    id: obj._id,
    image: obj.image || obj.images?.[0],
  };
};

export const buildProductQuery = (query) => {
  const filter = { isActive: { $ne: false } };
  const {
    search,
    category,
    categories,
    brands,
    priceMin,
    priceMax,
    rating,
    inStock,
    discount,
  } = query;

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) filter.category = new RegExp(category, 'i');
  if (categories) {
    const list = categories.split(',').map((c) => c.trim());
    filter.category = { $in: list.map((c) => new RegExp(`^${c}$`, 'i')) };
  }
  if (brands) {
    const list = brands.split(',').map((b) => b.trim());
    filter.brand = { $in: list.map((b) => new RegExp(`^${b}$`, 'i')) };
  }
  if (priceMin || priceMax) {
    filter.price = {};
    if (priceMin) filter.price.$gte = Number(priceMin);
    if (priceMax) filter.price.$lte = Number(priceMax);
  }
  if (rating) filter.rating = { $gte: Number(rating) };
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (discount) filter.discount = { $gte: Number(discount) };

  let sort = { createdAt: -1 };
  const sortBy = query.sortBy || query.sort;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'price':
    case 'price-low':
      sort = { price: 1 };
      break;
    case 'price-high':
      sort = { price: -1 };
      break;
    case 'rating':
      sort = { rating: -1 };
      break;
    case 'popularity':
      sort = { popularity: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'trending':
      sort = { views: -1 };
      break;
    case 'bestsellers':
      sort = { soldCount: -1 };
      break;
    default:
      sort = { createdAt: sortOrder };
  }

  return { filter, sort };
};

export const applyPromoCode = (code, amount) => {
  const promos = {
    SAVE10: { discount: 0.1, type: 'percent' },
    FLAT100: { discount: 100, type: 'flat' },
    WELCOME50: { discount: 50, type: 'flat' },
  };
  const promo = promos[code?.toUpperCase()];
  if (!promo) return { valid: false, discount: 0 };
  const discount = promo.type === 'percent' ? amount * promo.discount : promo.discount;
  return { valid: true, discount: Math.min(discount, amount) };
};
