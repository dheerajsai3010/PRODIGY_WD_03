import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const fetchProducts = useCallback(async (currentPage = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sortBy: currentFilters.sortBy || searchParams.get('sortBy') || 'newest',
        ...(currentFilters.priceMin && currentFilters.priceMin !== '0' && { priceMin: currentFilters.priceMin }),
        ...(currentFilters.priceMax && currentFilters.priceMax !== '10000' && { priceMax: currentFilters.priceMax }),
        ...(currentFilters.categories?.length && { categories: currentFilters.categories.join(',') }),
        ...(currentFilters.brands?.length && { brands: currentFilters.brands.join(',') }),
        ...(currentFilters.rating && { rating: currentFilters.rating }),
        ...(currentFilters.inStock && { inStock: 'true' }),
        ...(searchParams.get('categories') && !currentFilters.categories?.length && { categories: searchParams.get('categories') }),
      };
      const res = await api.getProducts(params);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchParams]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, filters);
  }, [filters, fetchProducts]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProducts(newPage, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">All Products</h1>
        <p className="text-slate-600">Discover our curated collection</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductFilters
          onFilterChange={handleFilterChange}
          mobileOpen={mobileFiltersOpen}
          setMobileOpen={setMobileFiltersOpen}
        />

        <div className="flex-1">
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-slate-600">
              {pagination.totalProducts || 0} products found
            </p>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field !w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-lg font-medium text-slate-600">No products found</p>
              <button onClick={() => handleFilterChange({ priceMin: '0', priceMax: '10000', categories: [], brands: [], rating: '', inStock: false, sortBy: 'newest' })} className="btn-primary mt-4">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!pagination.hasPrev}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNext}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
