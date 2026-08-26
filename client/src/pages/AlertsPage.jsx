import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, Zap, CheckCircle, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
import { alertApi } from '../api';
import { useAuth } from '../context/AuthContext';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const { isAuthenticated, user } = useAuth();

  const fetchAlerts = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await alertApi.getAlerts();
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    try {
      await alertApi.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const handleTestTrigger = async (id) => {
    try {
      setTriggeringId(id);
      const res = await alertApi.testTrigger(id);
      if (res.data.success) {
        setNotificationMsg(`Price drop simulated! Alert email dispatched to ${user?.email}`);
        fetchAlerts();
        setTimeout(() => setNotificationMsg(''), 4000);
      }
    } catch (err) {
      console.error('Test trigger failed:', err);
    } finally {
      setTriggeringId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Bell className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to manage Price Drop Alerts</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Set custom target budgets on any product and get automated email notifications when prices crash.
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
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>Price Drop Alerts Monitor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts dispatched to <strong className="text-slate-700">{user?.email}</strong>
          </p>
        </div>
        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full self-start sm:self-auto">
          {alerts.length} Active Trackers
        </span>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 animate-fadeIn">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No price alerts set yet</h3>
          <p className="text-xs text-slate-500">
            Open any product page and click <strong>"Set Price Drop Alert"</strong> to specify your target price.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const product = alert.product;
            if (!product) return null;
            const currentCheapest = product.cheapestSource?.price || product.sources?.[0]?.currentPrice || 0;
            const isTriggered = alert.status === 'triggered';

            return (
              <div
                key={alert._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isTriggered ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Product details */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={product.thumbnail || product.images?.[0]}
                    alt={product.name}
                    className="w-14 h-14 object-contain rounded-xl bg-slate-50 p-1.5 border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-600 truncate block"
                    >
                      {product.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Store: <strong className="capitalize text-slate-700">{alert.retailerPreference}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-emerald-600">₹{alert.targetPrice.toLocaleString('en-IN')}</strong></span>
                      <span>•</span>
                      <span>Current: <strong className="text-slate-900">₹{currentCheapest.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {isTriggered ? (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Target Hit
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
                      Active
                    </span>
                  )}

                  {/* Test Trigger Button for immediate demo / verification */}
                  <button
                    onClick={() => handleTestTrigger(alert._id)}
                    disabled={triggeringId === alert._id}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-slate-200"
                    title="Simulate price drop and send email alert"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{triggeringId === alert._id ? 'Sending...' : 'Test Drop'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
