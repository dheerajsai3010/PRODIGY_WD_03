import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/products/StarRating';
import ProductCard from '../components/products/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const TABS = ['Description', 'Specifications', 'Shipping', 'Returns'];

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('Description');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.getProduct(id),
          api.getProductReviews(id),
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
        setReviewSummary(reviewsRes.summary);
      } catch {
        showToast('Product not found', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="container-app py-8">
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="btn-primary mt-4 inline-flex">Back to Products</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="container-app py-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span className="mx-2">/</span>
        <Link to={`/products?categories=${product.category}`} className="hover:text-primary-600">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="group relative aspect-square overflow-hidden">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-150"
              />
            </div>
            <div className="flex gap-2 p-3">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${activeImage === i ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.rating} size="lg" />
            <a href="#reviews" className="text-sm text-primary-600 hover:underline">
              {product.reviewCount} reviews
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-red-600">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                <span className="badge-discount">{product.discount}% OFF</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Inclusive of all taxes</p>

          <div className="mt-4 space-y-2 text-sm">
            <p>{inStock ? <span className="badge-stock-in">{product.stock} items left in stock</span> : <span className="badge-stock-out">Out of Stock</span>}</p>
            <p className="text-slate-500">SKU: {product.sku}</p>
            <p className="text-slate-600">{product.shortDescription || product.description?.slice(0, 150)}</p>
          </div>

          {product.features?.length > 0 && (
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-700">
              {product.features.slice(0, 4).map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center rounded-lg border border-slate-300">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-slate-100">−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))} className="w-12 border-x border-slate-300 py-2 text-center" min={1} max={10} />
              <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-3 py-2 hover:bg-slate-100">+</button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button onClick={handleAddToCart} disabled={!inStock} className={`w-full ${inStock ? 'btn-primary' : 'btn-disabled'}`}>
              Add to Cart
            </button>
            <Link to="/checkout" onClick={handleAddToCart} className="btn-secondary block w-full text-center">
              Buy Now
            </Link>
            <button onClick={() => setWishlisted(!wishlisted)} className="btn-ghost w-full">
              {wishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="py-6 text-sm leading-relaxed text-slate-700">
          {activeTab === 'Description' && <p>{product.description}</p>}
          {activeTab === 'Specifications' && (
            <table className="w-full max-w-lg">
              <tbody>
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{key}</td>
                    <td className="py-2">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'Shipping' && <p>Free delivery on orders above ₹500. Standard delivery in 5-7 business days across India.</p>}
          {activeTab === 'Returns' && <p>30-day easy return policy. Product must be unused with original packaging.</p>}
        </div>
      </div>

      <section id="reviews" className="mt-12">
        <h2 className="mb-6 text-xl font-bold">Customer Reviews</h2>
        {reviewSummary && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="text-center md:text-left">
              <p className="text-4xl font-bold">{reviewSummary.avgRating}</p>
              <StarRating rating={reviewSummary.avgRating} size="lg" />
              <p className="mt-1 text-sm text-slate-500">{reviewSummary.totalReviews} reviews</p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-12">{star} ★</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${reviewSummary.ratingDistribution?.[star] || 0}%` }} />
                  </div>
                  <span className="w-10 text-slate-500">{reviewSummary.ratingDistribution?.[star] || 0}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAuthenticated && (
          <button className="btn-secondary mb-6">Write a Review</button>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <StarRating rating={review.rating} />
                  <h4 className="mt-1 font-semibold">{review.title}</h4>
                  <p className="text-sm text-slate-600">{review.text}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {review.author} · {new Date(review.date).toLocaleDateString()}
                    {review.verified && <span className="ml-2 text-green-600">✓ Verified Purchase</span>}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {product.relatedProducts?.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold">Related Products</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 md:hidden">
        <button onClick={handleAddToCart} disabled={!inStock} className={`w-full ${inStock ? 'btn-primary' : 'btn-disabled'}`}>
          Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
        </button>
      </div>
    </div>
  );
}
