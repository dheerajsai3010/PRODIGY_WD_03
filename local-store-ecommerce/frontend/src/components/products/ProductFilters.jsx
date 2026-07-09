import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
const BRANDS = ['TechPro', 'StyleHub', 'ReadWell', 'HomeCraft', 'ActiveFit', 'Nova', 'UrbanLine'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'popularity', label: 'Popularity' },
];

export default function ProductFilters({ onFilterChange, mobileOpen, setMobileOpen }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    priceMin: searchParams.get('priceMin') || '0',
    priceMax: searchParams.get('priceMax') || '10000',
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const [expanded, setExpanded] = useState({ category: true, brand: true, rating: true });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.priceMin !== '0') params.set('priceMin', filters.priceMin);
    if (filters.priceMax !== '10000') params.set('priceMax', filters.priceMax);
    if (filters.categories.length) params.set('categories', filters.categories.join(','));
    if (filters.brands.length) params.set('brands', filters.brands.join(','));
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
    setSearchParams(params, { replace: true });
    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggleArray = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const clearAll = () => {
    setFilters({
      priceMin: '0',
      priceMax: '10000',
      categories: [],
      brands: [],
      rating: '',
      inStock: false,
      sortBy: 'newest',
    });
  };

  const activeCount =
    (filters.categories.length ? 1 : 0) +
    (filters.brands.length ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.priceMin !== '0' || filters.priceMax !== '10000' ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">
          Filters {activeCount > 0 && <span className="ml-1 rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">{activeCount}</span>}
        </h2>
        <button onClick={clearAll} className="text-sm font-medium text-red-600 hover:text-red-700">Clear All</button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Price Range (₹)</label>
        <div className="flex gap-2">
          <input type="number" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} className="input-field" placeholder="Min" />
          <input type="number" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} className="input-field" placeholder="Max" />
        </div>
        <p className="mt-1 text-xs text-slate-500">₹{filters.priceMin} - ₹{filters.priceMax}</p>
      </div>

      <div>
        <button onClick={() => setExpanded({ ...expanded, category: !expanded.category })} className="mb-2 flex w-full items-center justify-between text-sm font-semibold">
          Category
          <span>{expanded.category ? '−' : '+'}</span>
        </button>
        {expanded.category && CATEGORIES.map((cat) => (
          <label key={cat} className="mb-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={filters.categories.includes(cat)} onChange={() => toggleArray('categories', cat)} className="rounded" />
            {cat}
          </label>
        ))}
      </div>

      <div>
        <button onClick={() => setExpanded({ ...expanded, brand: !expanded.brand })} className="mb-2 flex w-full items-center justify-between text-sm font-semibold">
          Brand
          <span>{expanded.brand ? '−' : '+'}</span>
        </button>
        {expanded.brand && BRANDS.map((brand) => (
          <label key={brand} className="mb-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => toggleArray('brands', brand)} className="rounded" />
            {brand}
          </label>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Rating</p>
        {[4, 3, 2, 1].map((r) => (
          <label key={r} className="mb-2 flex items-center gap-2 text-sm">
            <input type="radio" name="rating" checked={filters.rating === String(r)} onChange={() => setFilters({ ...filters, rating: String(r) })} />
            {r}+ Stars
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} className="rounded" />
        In Stock Only
      </label>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="btn-secondary">
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="input-field !w-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <aside className="hidden w-full shrink-0 lg:block lg:w-1/4">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <FilterContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl animate-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">✕</button>
            </div>
            <FilterContent />
            <button onClick={() => setMobileOpen(false)} className="btn-primary mt-6 w-full">Apply Filters</button>
          </div>
        </div>
      )}
    </>
  );
}

export { SORT_OPTIONS };
