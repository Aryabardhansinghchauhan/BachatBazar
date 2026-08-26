import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  Bell,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Share2,
  Tag
} from 'lucide-react';
import { productApi } from '../api';
import PriceChart from '../components/PriceChart';
import RetailerCompareTable from '../components/RetailerCompareTable';
import PriceAlertModal from '../components/PriceAlertModal';
import { useWishlist } from '../context/WishlistContext';

const ProductDetailPage = () => {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [historyData, setHistoryData] = useState({ chartData: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await productApi.getByIdOrSlug(idOrSlug);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          setSelectedImage(prod.thumbnail || prod.images?.[0] || '');

          // Fetch price history
          const histRes = await productApi.getPriceHistory(prod._id);
          if (histRes.data.success) {
            setHistoryData(histRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-6 w-32 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 rounded-3xl animate-shimmer" />
          <div className="space-y-4">
            <div className="h-10 rounded-xl animate-shimmer" />
            <div className="h-32 rounded-2xl animate-shimmer" />
            <div className="h-40 rounded-2xl animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you requested might have been moved or removed.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Back to Bachat Bazar Home
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  const cheapest = product.cheapestSource || (product.sources && product.sources[0]);
  const cheapestRetailer = cheapest?.retailer;
  const cheapestPrice = cheapest?.price || 0;
  const maxMrp = Math.max(...(product.sources?.map(s => s.mrp) || [cheapestPrice]));
  const savingsVsMrp = maxMrp > cheapestPrice ? maxMrp - cheapestPrice : 0;
  const discountPct = maxMrp > cheapestPrice ? Math.round((savingsVsMrp / maxMrp) * 100) : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to products</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied! ✓' : 'Share Deal'}</span>
        </button>
      </div>

      {/* Top Hero Section: Gallery + Buy Comparison Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 sticky top-24">
          <div className="h-80 w-full flex items-center justify-center p-4 bg-slate-50 rounded-2xl relative overflow-hidden">
            <img
              src={selectedImage || product.thumbnail}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300"
            />
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-sm">
                Save {discountPct}% (₹{savingsVsMrp.toLocaleString('en-IN')})
              </span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-emerald-500 scale-105' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Best Deal Box & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-xs font-semibold text-slate-400">by {product.brand}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Featured Lowest Price Box */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl p-6 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lowest Price Found on {cheapestRetailer?.toUpperCase()}</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Verified Live
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900">
                ₹{cheapestPrice.toLocaleString('en-IN')}
              </span>
              {maxMrp > cheapestPrice && (
                <>
                  <span className="text-lg text-slate-400 line-through font-medium">
                    ₹{maxMrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Buying on <strong className="text-slate-900 capitalize">{cheapestRetailer}</strong> currently saves you{' '}
              <strong className="text-emerald-700">₹{savingsVsMrp.toLocaleString('en-IN')}</strong> compared to MRP.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={cheapest?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-emerald-600/20 text-center flex items-center justify-center gap-2 text-sm"
              >
                <span>Go to Deal on {cheapestRetailer?.toUpperCase()}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-sm text-center flex items-center justify-center gap-2 text-sm"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Set Price Drop Alert</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-100/60 text-xs text-slate-500">
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-1.5 font-bold transition-colors ${
                  inWishlist ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                <span>{inWishlist ? 'Tracking in Wishlist' : 'Add to Tracked Wishlist'}</span>
              </button>

              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Direct Official Store Links</span>
              </span>
            </div>
          </div>

          {/* Description Snippet */}
          {product.description && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Store Side-by-Side Detailed Breakdown */}
      <RetailerCompareTable sources={product.sources} productName={product.name} />

      {/* 6-Month Interactive Price History Graph */}
      <PriceChart chartData={historyData.chartData} stats={historyData.stats} />

      {/* Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Key Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-500">{key}</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={product}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
};

export default ProductDetailPage;
