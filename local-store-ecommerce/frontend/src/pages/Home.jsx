import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const CATEGORY_ITEMS = [
  {
    name: 'Electronics',
    emoji: '🖥️',
    color: 'from-blue-500 to-indigo-600',
    icon: (
      <svg className="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  },
  {
    name: 'Clothing',
    emoji: '👕',
    color: 'from-pink-500 to-rose-600',
    icon: (
      <svg className="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.38 3.46L16 1.64l-4 3.82-4-3.82-4.38 1.82a2 2 0 0 0-1.18 2.29l1.66 9.4a2 2 0 0 0 1.97 1.67h11.86a2 2 0 0 0 1.97-1.67l1.66-9.4a2 2 0 0 0-1.18-2.29z" />
        <path d="M12 5.46V22" />
      </svg>
    )
  },
  {
    name: 'Books',
    emoji: '📚',
    color: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  },
  {
    name: 'Home',
    emoji: '🏠',
    color: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    name: 'Sports',
    emoji: '⚽',
    color: 'from-violet-500 to-purple-600',
    icon: (
      <svg className="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    )
  }
];

export default function Home() {
  const [categoriesData, setCategoriesData] = useState({
    Electronics: [],
    Clothing: [],
    Books: [],
    Home: [],
    Sports: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeProducts() {
      setLoading(true);
      try {
        const [electronicsRes, clothingRes, booksRes, homeRes, sportsRes] = await Promise.all([
          api.getProducts({ categories: 'Electronics', limit: 4 }),
          api.getProducts({ categories: 'Clothing', limit: 4 }),
          api.getProducts({ categories: 'Books', limit: 4 }),
          api.getProducts({ categories: 'Home', limit: 4 }),
          api.getProducts({ categories: 'Sports', limit: 4 })
        ]);

        setCategoriesData({
          Electronics: electronicsRes.data || [],
          Clothing: clothingRes.data || [],
          Books: booksRes.data || [],
          Home: homeRes.data || [],
          Sports: sportsRes.data || []
        });
      } catch (err) {
        console.error("Failed to load products for categories:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══════════ Hero Banner ═══════════ */}
      <section className="gradient-brand text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="hero-blob w-72 h-72 bg-indigo-400/30 top-[-50px] left-[-50px]" />
        <div className="hero-blob w-96 h-96 bg-violet-500/20 bottom-[-80px] right-[-80px]" style={{ animationDelay: '2s' }} />
        <div className="hero-blob w-48 h-48 bg-blue-400/20 top-[20%] right-[20%]" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        <div className="container-app py-20 md:py-32 relative z-10">
          <div className="max-w-2xl animate-fade-in text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-indigo-100 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Free Delivery on Orders Above ₹500
            </div>

            <h1 className="text-4xl font-black md:text-6xl tracking-tight leading-[1.1]">
              Welcome to{' '}
              <span className="gradient-text">Urban Cart</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-indigo-100/80 font-medium leading-relaxed max-w-lg">
              Browse quality products from your neighborhood store. Fast delivery, great prices, and trusted service.
            </p>
            <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                to="/products"
                className="group rounded-2xl bg-white px-8 py-4 font-bold text-primary-700 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
              >
                Shop Now
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/products?sortBy=popularity"
                className="rounded-2xl border border-white/25 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                🔥 Trending Products
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap justify-center md:justify-start gap-8">
              {[
                { value: '50+', label: 'Products' },
                { value: '5', label: 'Categories' },
                { value: '24/7', label: 'Support' },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-sm text-indigo-200/70 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Shop by Category ═══════════ */}
      <section className="container-app py-16 md:py-20">
        <div className="mb-12 text-center">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore products across our diverse categories</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {CATEGORY_ITEMS.map((item, i) => (
            <Link
              key={item.name}
              to={`/products?categories=${item.name}`}
              className="category-card group flex flex-col items-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="category-icon mb-4 shadow-sm">
                {item.icon}
              </div>
              <span className="font-bold text-slate-800 text-sm md:text-base tracking-tight">{item.name}</span>
              <span className="mt-1 text-xs text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Browse →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ Featured Collections ═══════════ */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/60 py-16 md:py-20">
        <div className="container-app space-y-16 md:space-y-24">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="section-title">Featured Collections</h2>
            <p className="section-subtitle">Our top picked products from each section, ready for fast delivery</p>
          </div>

          {CATEGORY_ITEMS.map((catItem, catIndex) => {
            const catProducts = categoriesData[catItem.name] || [];
            return (
              <div key={catItem.name} className="animate-fade-in">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${catItem.color} text-white shadow-md`}>
                      {catItem.icon}
                    </span>
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">{catItem.name}</h3>
                      <p className="text-xs text-slate-400 font-medium hidden sm:block">Top picks in {catItem.name.toLowerCase()}</p>
                    </div>
                  </div>
                  <Link
                    to={`/products?categories=${catItem.name}`}
                    className="group flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-all duration-200 rounded-xl bg-primary-50 px-4 py-2 hover:bg-primary-100"
                  >
                    View All
                    <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>

                {/* Section Products Grid */}
                {loading ? (
                  <LoadingSkeleton count={4} />
                ) : catProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 font-medium">
                    No products found in {catItem.name}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {catProducts.map((product) => (
                      <ProductCard key={product.id || product._id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ Trust Badges ═══════════ */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">We make shopping easy, secure, and enjoyable</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Free Shipping',
                desc: 'On all orders above ₹500. Fast & reliable delivery to your doorstep.',
                icon: (
                  <svg className="trust-badge-icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                )
              },
              {
                title: 'Secure Payment',
                desc: 'Pay safely using UPI, Cards & Net Banking. Your data is always protected.',
                icon: (
                  <svg className="trust-badge-icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )
              },
              {
                title: 'Easy Returns',
                desc: '30-day hassle-free return policy. Full refund if you\'re not satisfied.',
                icon: (
                  <svg className="trust-badge-icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                )
              },
            ].map((feature) => (
              <div key={feature.title} className="trust-badge">
                {feature.icon}
                <h3 className="font-extrabold text-slate-800 text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Newsletter Banner ═══════════ */}
      <section className="gradient-brand py-16 relative overflow-hidden">
        <div className="hero-blob w-64 h-64 bg-indigo-400/20 top-[-40px] right-[-40px]" />
        <div className="container-app relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Stay Updated</h2>
          <p className="mt-3 text-indigo-100/80 font-medium max-w-md mx-auto">Subscribe to our newsletter for exclusive deals and new arrivals.</p>
          <form className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-4 text-sm text-white placeholder:text-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              required
            />
            <button type="submit" className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 font-bold text-primary-700 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
