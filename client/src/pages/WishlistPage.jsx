import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ExternalLink, ArrowRight, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your Tracked Products</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Track products across Flipkart and Amazon, set target drop alerts, and get notified instantly.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <span>Tracked Products Wishlist</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring live price shifts across Flipkart & Amazon for your tracked catalog
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
          {wishlistItems.length} Products Tracked
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your tracked list is empty</h3>
          <p className="text-xs text-slate-500">
            Click the heart icon on any product to start tracking its price and receive instant drop alerts.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            <span>Explore Today's Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product) => {
            const cheapest = product.cheapestSource || (product.sources && product.sources[0]);
            const price = cheapest?.price || 0;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={product.thumbnail || product.images?.[0]}
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-2 border border-slate-100 flex-shrink-0"
                    />
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove from tracking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/product/${product.slug || product._id}`}
                    className="block text-sm font-bold text-slate-900 hover:text-emerald-600 line-clamp-2 transition-colors mb-2"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="capitalize font-semibold text-slate-700">{cheapest?.retailer}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-extrabold text-sm">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/product/${product.slug || product._id}`}
                    className="flex-1 py-2 text-center bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    View Price Graph
                  </Link>
                  <a
                    href={cheapest?.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Buy now"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
