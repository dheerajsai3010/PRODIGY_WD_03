import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
const brands = ['TechPro', 'StyleHub', 'ReadWell', 'HomeCraft', 'ActiveFit', 'Nova', 'UrbanLine'];

const productTemplates = [
  // ── Electronics (10 products) ──
  { name: 'Wireless Bluetooth Headphones', category: 'Electronics', brand: 'TechPro', price: 2499, originalPrice: 3999, discount: 38, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop' },
  { name: 'Smart Watch Series 5', category: 'Electronics', brand: 'TechPro', price: 4999, originalPrice: 6999, discount: 29, image: 'https://s3n.cashify.in/cashify/product/img/xxhdpi/211b52c6-bfdc.jpg' },
  { name: 'USB-C Fast Charger 65W', category: 'Electronics', brand: 'Nova', price: 1299, originalPrice: 1999, discount: 35, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop' },
  { name: 'Portable Bluetooth Speaker', category: 'Electronics', brand: 'TechPro', price: 1899, originalPrice: 2499, discount: 24, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop' },
  { name: 'Mechanical Keyboard RGB', category: 'Electronics', brand: 'TechPro', price: 3499, originalPrice: 4999, discount: 30, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop' },
  { name: 'Wireless Gaming Mouse', category: 'Electronics', brand: 'TechPro', price: 1599, originalPrice: 2499, discount: 36, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=600&fit=crop' },
  { name: 'Noise Cancelling Earbuds', category: 'Electronics', brand: 'Nova', price: 3999, originalPrice: 5999, discount: 33, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop' },
  { name: '4K Webcam with Microphone', category: 'Electronics', brand: 'TechPro', price: 2799, originalPrice: 3999, discount: 30, image: 'https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=600&h=600&fit=crop' },
  { name: 'Portable Power Bank 20000mAh', category: 'Electronics', brand: 'Nova', price: 999, originalPrice: 1499, discount: 33, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop' },
  { name: 'Digital Drawing Tablet', category: 'Electronics', brand: 'TechPro', price: 5499, originalPrice: 7999, discount: 31, image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&h=600&fit=crop' },

  // ── Clothing (10 products) ──
  { name: 'Men Cotton Casual T-Shirt', category: 'Clothing', brand: 'StyleHub', price: 599, originalPrice: 999, discount: 40, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop' },
  { name: 'Women Denim Jacket', category: 'Clothing', brand: 'UrbanLine', price: 1899, originalPrice: 2999, discount: 37, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop' },
  { name: 'Running Sports Shoes', category: 'Clothing', brand: 'ActiveFit', price: 2499, originalPrice: 3499, discount: 29, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop' },
  { name: 'Classic Cotton Kurta Set', category: 'Clothing', brand: 'StyleHub', price: 1299, originalPrice: 1799, discount: 28, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop' },
  { name: 'Graphic Print Hoodie', category: 'Clothing', brand: 'UrbanLine', price: 1499, originalPrice: 2199, discount: 32, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop' },
  { name: 'Slim Fit Formal Shirt', category: 'Clothing', brand: 'StyleHub', price: 899, originalPrice: 1399, discount: 36, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop' },
  { name: 'Women Floral Summer Dress', category: 'Clothing', brand: 'UrbanLine', price: 1699, originalPrice: 2499, discount: 32, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop' },
  { name: 'Premium Leather Wallet', category: 'Clothing', brand: 'StyleHub', price: 699, originalPrice: 1099, discount: 36, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop' },
  { name: 'Aviator Sunglasses UV400', category: 'Clothing', brand: 'UrbanLine', price: 799, originalPrice: 1299, discount: 38, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop' },
  { name: 'Cotton Joggers Relaxed Fit', category: 'Clothing', brand: 'ActiveFit', price: 999, originalPrice: 1499, discount: 33, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop' },

  // ── Books (10 products) ──
  { name: 'The Art of Programming', category: 'Books', brand: 'ReadWell', price: 499, originalPrice: 699, discount: 29, image: 'https://images.unsplash.com/photo-1544947950-fa07a98da237?w=600&h=600&fit=crop' },
  { name: 'Indian History Encyclopedia', category: 'Books', brand: 'ReadWell', price: 799, originalPrice: 999, discount: 20, image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=600&fit=crop' },
  { name: 'Mindfulness & Meditation Guide', category: 'Books', brand: 'ReadWell', price: 349, originalPrice: 499, discount: 30, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop' },
  { name: 'Children Story Collection', category: 'Books', brand: 'ReadWell', price: 299, originalPrice: 449, discount: 33, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop' },
  { name: 'Science Fiction Novel Bundle', category: 'Books', brand: 'ReadWell', price: 899, originalPrice: 1299, discount: 31, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=600&fit=crop' },
  { name: 'Cookbook: 100 Indian Recipes', category: 'Books', brand: 'ReadWell', price: 599, originalPrice: 899, discount: 33, image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=600&fit=crop' },
  { name: 'Personal Finance Mastery', category: 'Books', brand: 'ReadWell', price: 449, originalPrice: 649, discount: 31, image: 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=600&h=600&fit=crop' },
  { name: 'World Atlas Illustrated Edition', category: 'Books', brand: 'ReadWell', price: 1299, originalPrice: 1799, discount: 28, image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=600&fit=crop' },
  { name: 'Mystery Thriller Box Set', category: 'Books', brand: 'ReadWell', price: 749, originalPrice: 1099, discount: 32, image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&h=600&fit=crop' },
  { name: 'Learn Python in 30 Days', category: 'Books', brand: 'ReadWell', price: 399, originalPrice: 599, discount: 33, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop' },

  // ── Home (10 products) ──
  { name: 'Non-Stick Cookware Set', category: 'Home', brand: 'HomeCraft', price: 2999, originalPrice: 4499, discount: 33, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop' },
  { name: 'LED Desk Lamp with USB', category: 'Home', brand: 'HomeCraft', price: 899, originalPrice: 1299, discount: 31, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop' },
  { name: 'Memory Foam Pillow', category: 'Home', brand: 'HomeCraft', price: 699, originalPrice: 999, discount: 30, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop' },
  { name: 'Decorative Wall Clock', category: 'Home', brand: 'Nova', price: 449, originalPrice: 699, discount: 36, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=600&fit=crop' },
  { name: 'Air Purifier HEPA Filter', category: 'Home', brand: 'Nova', price: 5999, originalPrice: 7999, discount: 25, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop' },
  { name: 'Ceramic Planter Set of 3', category: 'Home', brand: 'HomeCraft', price: 599, originalPrice: 899, discount: 33, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop' },
  { name: 'Scented Candle Gift Box', category: 'Home', brand: 'Nova', price: 349, originalPrice: 549, discount: 36, image: 'https://images.unsplash.com/photo-1602607616969-0cb34a48701c?w=600&h=600&fit=crop' },
  { name: 'Cotton Bedsheet King Size', category: 'Home', brand: 'HomeCraft', price: 1499, originalPrice: 2199, discount: 32, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=600&fit=crop' },
  { name: 'Stainless Steel Water Bottle', category: 'Home', brand: 'HomeCraft', price: 499, originalPrice: 799, discount: 38, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop' },
  { name: 'Aroma Diffuser Humidifier', category: 'Home', brand: 'Nova', price: 1299, originalPrice: 1899, discount: 32, image: 'https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?w=600&h=600&fit=crop' },

  // ── Sports (10 products) ──
  { name: 'Yoga Mat Premium 6mm', category: 'Sports', brand: 'ActiveFit', price: 799, originalPrice: 1199, discount: 33, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop' },
  { name: 'Adjustable Dumbbell Set 10kg', category: 'Sports', brand: 'ActiveFit', price: 3499, originalPrice: 4999, discount: 30, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop' },
  { name: 'Cricket Bat English Willow', category: 'Sports', brand: 'ActiveFit', price: 4999, originalPrice: 6999, discount: 29, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=600&fit=crop' },
  { name: 'Resistance Bands Set', category: 'Sports', brand: 'ActiveFit', price: 599, originalPrice: 899, discount: 33, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop' },
  { name: 'Badminton Racket Pair', category: 'Sports', brand: 'ActiveFit', price: 899, originalPrice: 1399, discount: 36, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=600&fit=crop' },
  { name: 'Football FIFA Size 5', category: 'Sports', brand: 'ActiveFit', price: 699, originalPrice: 999, discount: 30, image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=600&fit=crop' },
  { name: 'Skipping Rope Speed Pro', category: 'Sports', brand: 'ActiveFit', price: 299, originalPrice: 499, discount: 40, image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=600&fit=crop' },
  { name: 'Gym Gloves with Wrist Support', category: 'Sports', brand: 'ActiveFit', price: 499, originalPrice: 799, discount: 38, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop' },
  { name: 'Swimming Goggles Anti-Fog', category: 'Sports', brand: 'ActiveFit', price: 399, originalPrice: 649, discount: 39, image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=600&fit=crop' },
  { name: 'Foam Roller Massage 45cm', category: 'Sports', brand: 'ActiveFit', price: 649, originalPrice: 999, discount: 35, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=600&fit=crop' },
];

const seed = async () => {
  await connectDB();
  await Product.deleteMany({});
  await User.deleteMany({ email: { $in: ['admin@urbancart.com', 'demo@urbancart.com'] } });

  const products = productTemplates.map((p, i) => ({
    ...p,
    sku: `SKU-${1000 + i}`,
    description: `High quality ${p.name.toLowerCase()} from our Urban Cart store. Perfect for everyday use with excellent durability and value for money. This product has been carefully selected by our team to ensure the best shopping experience.`,
    shortDescription: `Premium ${p.category.toLowerCase()} product with great reviews.`,
    image: p.image,
    images: [
      p.image
    ],
    stock: Math.floor(Math.random() * 50) + 5,
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    reviewCount: Math.floor(Math.random() * 200) + 10,
    popularity: Math.floor(Math.random() * 1000),
    views: Math.floor(Math.random() * 5000),
    soldCount: Math.floor(Math.random() * 500),
    features: ['Premium quality', 'Fast delivery', '1 year warranty', 'Easy returns'],
    specifications: {
      Brand: p.brand,
      Category: p.category,
      Warranty: '1 Year',
      Origin: 'India',
    },
  }));

  await Product.insertMany(products);

  await User.create({
    name: 'Admin User',
    email: 'admin@urbancart.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '9876543210',
  });

  await User.create({
    name: 'Demo Customer',
    email: 'demo@urbancart.com',
    password: 'Demo@1234',
    role: 'user',
    phone: '9123456789',
  });

  console.log(`Seeded ${products.length} products and 2 users`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
