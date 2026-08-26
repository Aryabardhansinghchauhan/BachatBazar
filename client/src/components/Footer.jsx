import React from 'react';
import { ShoppingCart, ShieldCheck, Zap, BellRing, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Value props bar */}
      <div className="border-b border-slate-800 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Multi-Store Compare</h4>
                <p className="text-xs text-slate-400">Live prices from Flipkart & Amazon</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Real Deal Detector</h4>
                <p className="text-xs text-slate-400">6-Month historical price tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Instant Price Alerts</h4>
                <p className="text-xs text-slate-400">Email alerts when target price is hit</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Unbiased</h4>
                <p className="text-xs text-slate-400">No sponsored rankings or fluff</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-lg">
                🛒
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Bachat<span className="text-emerald-400">Bazar</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Bachat Bazar (Savings Market) is an open, modern price intelligence platform built specifically for Indian shoppers. Never overpay on electronics, mobiles, audio, or appliances again.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-slate-400">Supported Retailers:</span>
              <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 text-xs font-medium border border-blue-700/50">Flipkart</span>
              <span className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 text-xs font-medium border border-amber-700/50">Amazon India</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium">Croma</span>
              <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-300 text-xs font-medium border border-red-700/50">Reliance Digital</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/search?category=Mobiles" className="hover:text-emerald-400 transition-colors">Smartphones & Mobiles</a></li>
              <li><a href="/search?category=Laptops" className="hover:text-emerald-400 transition-colors">Laptops & MacBooks</a></li>
              <li><a href="/search?category=Audio" className="hover:text-emerald-400 transition-colors">Wireless Headphones & TWS</a></li>
              <li><a href="/search?category=Appliances" className="hover:text-emerald-400 transition-colors">Smart 4K TVs & Appliances</a></li>
              <li><a href="/search?category=Wearables" className="hover:text-emerald-400 transition-colors">Smartwatches & Fitness</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/wishlist" className="hover:text-emerald-400 transition-colors">Tracked Wishlist</a></li>
              <li><a href="/alerts" className="hover:text-emerald-400 transition-colors">Price Drop Alerts</a></li>
              <li><a href="/login" className="hover:text-emerald-400 transition-colors">User Sign In</a></li>
              <li><a href="/register" className="hover:text-emerald-400 transition-colors">Create Account</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Bachat Bazar. Built with ❤️ for smart Indian shoppers.</p>
          <p>Product prices and availability are accurate as of the last scrape and are subject to change.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
