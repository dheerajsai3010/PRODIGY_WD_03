import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

export default function SearchBar({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.autocomplete(query);
        setSuggestions(res.data);
        setOpen(true);
      } catch {
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q = query) => {
    if (!q.trim()) return;
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [q, ...recent.filter((s) => s !== q)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setOpen(false);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
          className="input-field search-input"
        />
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 spinner !border-primary-600 !border-t-transparent" />}
      </div>

      {open && suggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.products?.length === 0 && suggestions.categories?.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No results found</p>
          ) : (
            <>
              {suggestions.products?.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onNavigate?.(); navigate(`/products/${p.id}`); setOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-50"
                >
                  <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">₹{p.price?.toLocaleString('en-IN')}</p>
                  </div>
                </button>
              ))}
              {suggestions.categories?.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSearch(c.name)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {c.name} <span className="text-slate-400">({c.count})</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
