import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const id = product.id || product._id;
  const inStock = product.stock > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inStock) return;
    addToCart(product);
    showToast(`${product.name} added to cart`);
  };

  return (
    <article className="product-card card group relative overflow-hidden animate-slide-up">
      <Link to={`/products/${id}`} className="block">
        {/* Image Container */}
        <div className="product-card-image relative aspect-square overflow-hidden">
          {/* Shimmer placeholder */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          )}
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="badge-discount absolute left-3 top-3 shadow-md">
              {product.discount}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 backdrop-blur-sm"
            aria-label="Wishlist"
          >
            <svg className={`h-4 w-4 transition-colors duration-200 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} viewBox="0 0 24 24" stroke="currentColor" fill={wishlisted ? 'currentColor' : 'none'}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick View Overlay */}
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="absolute inset-x-4 bottom-4 translate-y-4 rounded-xl bg-white/95 py-2.5 text-sm font-bold opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-white"
            >
              Quick View
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2.5">
          {/* Brand Tag */}
          {product.brand && (
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">{product.brand}</span>
          )}

          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-slate-800 leading-snug group-hover:text-primary-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating || 0} />
            <span className="text-xs text-slate-400 font-medium">({product.reviewCount || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold text-slate-900">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through font-medium">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {inStock ? <span className="badge-stock-in">In Stock</span> : <span className="badge-stock-out">Out of Stock</span>}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full group/btn flex items-center justify-center gap-2 ${inStock ? 'btn-primary' : 'btn-disabled'}`}
        >
          <svg className="h-4 w-4 transition-transform duration-200 group-hover/btn:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
