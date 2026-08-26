import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, TrendingDown, Sparkles, ArrowRight, ShieldCheck, Zap, Bell, CheckCircle2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategoryChips from '../components/CategoryChips';
import { productApi } from '../api';

const HomePage = () => {
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealsRes, prodRes] = await Promise.all([
          productApi.getFeaturedDeals(),
          productApi.getProducts({ limit: 12, category: activeCategory !== 'All' ? activeCategory : undefined })
        ]);
        if (dealsRes.data.success) {
          setFeaturedDeals(dealsRes.data.data);
        }
        if (prodRes.data.success) {
          setAllProducts(prodRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickPicks = ['iPhone 15', 'Sony WH-1000XM5', 'MacBook Air M2', 'Samsung S24 Ultra', 'boAt Airdopes', 'Sony 4K TV'];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Never Overpay on Flipkart & Amazon Again</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Compare Prices. Track Drops. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Buy at the Absolute Lowest.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop opening 5 browser tabs. Bachat Bazar pulls live prices across Indian e-commerce sites, analyzes 6-month historical graphs, and pings you the second price drops.
          </p>

          {/* Main Hero Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search any product (e.g. 'iPhone 15 128gb', 'Sony XM5', 'MacBook Air')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-sm sm:text-base font-medium"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Find Deal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick search tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Popular Searches:</span>
            {quickPicks.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-900/50 hover:text-emerald-300 border border-slate-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Featured Live Deals */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Today's Hottest Indian Deals
                </h2>
                <p className="text-xs text-slate-500">
                  Products currently at or near their lowest ever recorded price
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl animate-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDeals.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Category Filter & Catalog Browser */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Explore Categories & Compare
              </h2>
              <p className="text-xs text-slate-500">
                Pick a category to see live prices across Flipkart and Amazon
              </p>
            </div>
          </div>

          <CategoryChips activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 rounded-2xl animate-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Value Explainer / How It Works */}
        <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Why Bachat Bazar Saves You Thousands
            </h3>
            <p className="text-sm text-slate-600">
              Indian e-commerce retailers change prices multiple times a day during sales, flash deals, and bank discount events. We automate the hunt so you never pay MRP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base">Multi-Store Live Sync</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We search Flipkart, Amazon India, and other stores simultaneously to extract current prices, seller credentials, and delivery options.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base">True Price History</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stores artificially mark up MRP before "festive sales". Our 6-month interactive price chart proves whether a deal is genuinely cheap.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base">Instant Price-Drop Alerts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set your desired budget. Our background monitors track the catalog and send an immediate email with direct purchase links when hit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
