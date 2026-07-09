Local Store E-commerce Platform
Task-03: A full-stack e-commerce website for a local store built with React + Vite + Tailwind CSS and Node.js + Express + MongoDB.

Features
Core (Required)
Product listings with grid layout, pagination, and filters
Product details with images, descriptions, prices, and reviews
Shopping cart with persistent storage
Multi-step checkout flow
Bonus
Order tracking with status timeline
User reviews and ratings
Customer support info in footer
Sort & filters for products
Search with autocomplete
User authentication (login/signup)
Razorpay payment integration (with dev mode fallback)
Tech Stack
Frontend: React 19, Vite, Tailwind CSS v4, React Router v7
Backend: Node.js, Express 5, MongoDB, Mongoose
Auth: JWT, bcrypt
Payment: Razorpay (optional)
Setup
1. Install dependencies
cd frontend && npm install
cd ../backend && npm install
2. Configure environment
Copy backend/.env.example to backend/.env and update MongoDB URI and JWT secret.

3. Seed database
cd backend
npm run seed
Demo accounts:

Customer: demo@localstore.com / Demo@1234
Admin: admin@localstore.com / Admin@123
4. Run development servers
cd backend && npm run dev
cd frontend && npm run dev
Frontend: http://localhost:5173
Backend API: http://localhost:5000
