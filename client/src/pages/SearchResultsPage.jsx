import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Frown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productApi } from '../api';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState('discount_desc');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        let res;
        if (query) {
          res = await productApi.search(query, selectedCategory !== 'All' ? selectedCategory : undefined);
        } else {
          res = await productApi.getProducts({
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            sort: sortOption,
            limit: 24
          });
        }

        if (res.data.success) {
          let list = res.data.data;
          // Apply sorting on client if search query mode
          if (query && sortOption) {
            if (sortOption === 'price_asc') {
              list = [...list].sort((a, b) => (a.cheapestSource?.price || 0) - (b.cheapestSource?.price || 0));
            } else if (sortOption === 'price_desc') {
              list = [...list].sort((a, b) => (b.cheapestSource?.price || 0) - (a.cheapestSource?.price || 0));
            }
          }
          setProducts(list);
        }

        const catRes = await productApi.getCategories();
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, selectedCategory, sortOption]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            {query ? (
              <span>Search Results for "<span className="text-emerald-600">{query}</span>"</span>
            ) : (
              <span>All Products Catalog</span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {loading ? 'Searching live stores...' : `Found ${products.length} products with live price comparison`}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="discount_desc">Biggest Discount</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Category Filter Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filter by Category</span>
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
              </button>

              {['Mobiles', 'Laptops', 'Audio', 'Appliances', 'Wearables'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Results */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl animate-shimmer" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <Frown className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find matches for your search term. Try searching for "iPhone", "Sony", "MacBook", or browse our top categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
