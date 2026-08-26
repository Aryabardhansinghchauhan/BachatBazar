import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ExternalLink, TrendingDown, Star, CheckCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, onSetAlert }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product._id);

  const flipkartSource = product.sources?.find(s => s.retailer === 'flipkart');
  const amazonSource = product.sources?.find(s => s.retailer === 'amazon');

  const cheapest = product.cheapestSource || (product.sources && product.sources[0]);
  const cheapestRetailer = cheapest?.retailer;
  const cheapestPrice = cheapest?.price || product.sources?.[0]?.currentPrice || 0;

  const maxMrp = Math.max(...(product.sources?.map(s => s.mrp) || [cheapestPrice]));
  const discountPct = maxMrp > cheapestPrice ? Math.round(((maxMrp - cheapestPrice) / maxMrp) * 100) : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top badges & Wishlist button */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {discountPct > 0 ? (
          <span className="px-2.5 py-1 bg-rose-500 text-white font-bold text-xs rounded-full shadow-sm">
            {discountPct}% OFF
          </span>
        ) : <span />}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-sm ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Track product price'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Image container */}
      <Link to={`/product/${product.slug || product._id}`} className="block p-6 bg-slate-50/50 group-hover:bg-slate-50 transition-colors text-center relative overflow-hidden">
        <img
          src={product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="h-44 w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 mx-auto"
          loading="lazy"
        />
      </Link>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-xs text-slate-400 font-medium">{product.brand}</span>
          )}
        </div>

        <Link to={`/product/${product.slug || product._id}`} className="flex-1">
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Side-by-Side Retailer Price Comparison Chips */}
        <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          {/* Flipkart Chip */}
          <div className={`p-2 rounded-lg text-center transition-all ${
            cheapestRetailer === 'flipkart'
              ? 'bg-blue-50 border border-blue-200 shadow-xs'
              : 'bg-white border border-slate-200 opacity-85'
          }`}>
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 mb-0.5">
              <span>Flipkart</span>
              {cheapestRetailer === 'flipkart' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
            </div>
            {flipkartSource ? (
              <div className="text-xs font-extrabold text-slate-900">
                ₹{flipkartSource.currentPrice.toLocaleString('en-IN')}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400">Out of Stock</div>
            )}
          </div>

          {/* Amazon Chip */}
          <div className={`p-2 rounded-lg text-center transition-all ${
            cheapestRetailer === 'amazon'
              ? 'bg-amber-50 border border-amber-200 shadow-xs'
              : 'bg-white border border-slate-200 opacity-85'
          }`}>
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 mb-0.5">
              <span>Amazon</span>
              {cheapestRetailer === 'amazon' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
            </div>
            {amazonSource ? (
              <div className="text-xs font-extrabold text-slate-900">
                ₹{amazonSource.currentPrice.toLocaleString('en-IN')}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400">Out of Stock</div>
            )}
          </div>
        </div>

        {/* Best Deal Summary Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Lowest Price</div>
            <div className="text-base font-extrabold text-emerald-600 flex items-baseline gap-1">
              <span>₹{cheapestPrice.toLocaleString('en-IN')}</span>
              {maxMrp > cheapestPrice && (
                <span className="text-xs text-slate-400 line-through font-normal">
                  ₹{maxMrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/product/${product.slug || product._id}`}
            className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Compare</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
