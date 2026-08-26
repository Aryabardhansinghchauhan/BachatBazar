import React, { useState } from 'react';
import { X, Bell, Check, AlertCircle, ArrowDownRight } from 'lucide-react';
import { alertApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PriceAlertModal = ({ product, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const currentPrice = product?.cheapestSource?.price || product?.sources?.[0]?.currentPrice || 0;
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9));
  const [retailerPreference, setRetailerPreference] = useState('any');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !product) return null;

  const handlePercentageClick = (pct) => {
    const calculated = Math.round(currentPrice * (1 - pct / 100));
    setTargetPrice(calculated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (targetPrice >= currentPrice) {
      setErrorMsg('Target price must be lower than current lowest price to trigger alert.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await alertApi.createAlert({
        productId: product._id,
        targetPrice: Number(targetPrice),
        retailerPreference
      });
      if (res.data.success) {
        setSuccessMsg('Price alert successfully created! We will email you the moment it drops.');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1800);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create price alert.');
    } finally {
      setLoading(false);
    }
  };

  const savingsAmount = Math.max(0, currentPrice - targetPrice);
  const savingsPct = currentPrice > 0 ? Math.round((savingsAmount / currentPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Set Price Drop Alert</h3>
            <p className="text-xs text-slate-400">Get notified the instant the price hits your target</p>
          </div>
        </div>

        {/* Product snapshot */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-5 border border-slate-100">
          <img
            src={product.thumbnail || product.images?.[0]}
            alt={product.name}
            className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{product.name}</p>
            <p className="text-xs text-emerald-600 font-bold">
              Current Lowest: ₹{currentPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick target presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quick Discount Target:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className="py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 transition-colors"
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Target Price input */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Target Price (₹):</span>
                <span className="text-emerald-600 font-bold">
                  Saves ₹{savingsAmount.toLocaleString('en-IN')} ({savingsPct}%)
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  max={currentPrice}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Retailer Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Store Preference:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'any', label: 'Any Store' },
                  { id: 'flipkart', label: 'Flipkart Only' },
                  { id: 'amazon', label: 'Amazon Only' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRetailerPreference(item.id)}
                    className={`py-2 rounded-xl font-semibold border transition-all ${
                      retailerPreference === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>{loading ? 'Setting Alert...' : 'Create Price Drop Alert'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
