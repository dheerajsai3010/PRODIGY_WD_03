import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await api.search(query);
        setProducts(res.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query]);

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold">Search Results</h1>
      <p className="mt-1 text-slate-600">
        {loading ? 'Searching...' : `${products.length} results for "${query}"`}
      </p>

      <div className="mt-8">
        {loading ? (
          <LoadingSkeleton />
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-lg text-slate-600">No products found for &quot;{query}&quot;</p>
            <Link to="/products" className="btn-primary mt-4 inline-flex">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
