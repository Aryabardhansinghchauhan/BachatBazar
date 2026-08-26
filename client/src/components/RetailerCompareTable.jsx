import React from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck, Truck, Store } from 'lucide-react';

const RetailerCompareTable = ({ sources = [], productName = '' }) => {
  if (!sources || sources.length === 0) return null;

  const validSources = sources.filter(s => s.currentPrice > 0);
  const lowestPrice = Math.min(...validSources.map(s => s.currentPrice));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Live Store Comparison ({sources.length} Retailers)</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">Prices updated hourly</span>
      </div>

      <div className="divide-y divide-slate-100">
        {sources.map((src, index) => {
          const isCheapest = src.currentPrice === lowestPrice;
          const isFlipkart = src.retailer === 'flipkart';
          const isAmazon = src.retailer === 'amazon';

          return (
            <div
              key={index}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isCheapest ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              {/* Retailer Brand & Stock */}
              <div className="flex items-center gap-4 min-w-[180px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs ${
                  isFlipkart
                    ? 'bg-blue-600 text-white'
                    : isAmazon
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 text-white'
                }`}>
                  {isFlipkart ? 'FK' : isAmazon ? 'AMZ' : src.retailer.toUpperCase().slice(0, 3)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 capitalize">
                      {src.retailer}
                    </span>
                    {isCheapest && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full tracking-wide">
                        BEST PRICE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[140px]">{src.seller || 'Verified Merchant'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="text-xs text-slate-600 flex items-center gap-1.5 min-w-[140px]">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>{src.deliveryText || 'Standard Delivery'}</span>
              </div>

              {/* Price & Savings */}
              <div className="text-left sm:text-right min-w-[130px]">
                <div className="text-lg font-extrabold text-slate-900 flex sm:justify-end items-baseline gap-1.5">
                  <span className={isCheapest ? 'text-emerald-700 font-black' : ''}>
                    ₹{src.currentPrice.toLocaleString('en-IN')}
                  </span>
                  {src.mrp > src.currentPrice && (
                    <span className="text-xs text-slate-400 line-through font-normal">
                      ₹{src.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {src.discountPct > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {src.discountPct}% Discount
                  </span>
                )}
              </div>

              {/* Direct Buy Out Link */}
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                  isCheapest
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : isFlipkart
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isAmazon
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Buy on {src.retailer.charAt(0).toUpperCase() + src.retailer.slice(1)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RetailerCompareTable;
