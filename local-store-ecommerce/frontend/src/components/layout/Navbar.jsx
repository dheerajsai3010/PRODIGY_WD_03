import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../common/SearchBar';

export default function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/cart', label: 'Cart' },
    { to: isAuthenticated ? '/account' : '/login', label: 'Account' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white font-black text-sm shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
              UC
            </span>
            <span className="hidden sm:inline text-lg font-extrabold text-slate-800 tracking-tight">
              Urban <span className="text-primary-600">Cart</span>
            </span>
          </Link>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
            <SearchBar />
          </div>

          {/* Right: Navigation Links & Actions */}
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Icons & Actions */}
            <div className="flex items-center gap-1.5 border-l border-slate-200/80 pl-4">
              {/* Mobile/Tablet Search Trigger */}
              <Link to="/search" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 md:hidden" aria-label="Search">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Cart Button */}
              <Link to="/cart" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200" aria-label="Cart">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-500 text-xs font-bold text-white shadow-md ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Authenticated user Actions */}
              {isAuthenticated ? (
                <button onClick={logout} className="hidden text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors duration-200 lg:block rounded-xl px-3 py-2 hover:bg-red-50">
                  Logout
                </button>
              ) : null}

              {/* Burger Menu Button */}
              <button
                className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Expandable Menu */}
        {menuOpen && (
          <nav className="animate-slide-in border-t border-slate-200/80 py-4 lg:hidden">
            <div className="mb-4 md:hidden">
              <SearchBar onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  Logout ({user?.name})
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
