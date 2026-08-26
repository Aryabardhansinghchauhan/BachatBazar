import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingDown, TrendingUp, Calendar, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const flipkartVal = payload.find(p => p.dataKey === 'flipkartPrice')?.value;
    const amazonVal = payload.find(p => p.dataKey === 'amazonPrice')?.value;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
        <div className="text-slate-400 font-medium pb-1 border-b border-slate-800">
          📅 {label}
        </div>
        {flipkartVal && (
          <div className="flex items-center justify-between text-blue-400 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Flipkart:
            </span>
            <span>₹{flipkartVal.toLocaleString('en-IN')}</span>
          </div>
        )}
        {amazonVal && (
          <div className="flex items-center justify-between text-amber-400 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Amazon:
            </span>
            <span>₹{amazonVal.toLocaleString('en-IN')}</span>
          </div>
        )}
        {flipkartVal && amazonVal && (
          <div className="pt-1 border-t border-slate-800 text-[11px] text-emerald-400 font-medium flex items-center justify-between">
            <span>Price Gap:</span>
            <span>₹{Math.abs(flipkartVal - amazonVal).toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const PriceChart = ({ chartData = [], stats = {} }) => {
  const [timeRange, setTimeRange] = useState('180'); // days

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    if (timeRange === 'all') return chartData;

    const days = parseInt(timeRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return chartData.filter(item => new Date(item.date) >= cutoff);
  }, [chartData, timeRange]);

  // Formatted date label (e.g., '15 Apr')
  const formattedChartData = useMemo(() => {
    return filteredData.map(item => {
      const d = new Date(item.date);
      return {
        ...item,
        displayDate: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      };
    });
  }, [filteredData]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-600">Gathering initial price history points...</p>
        <p className="text-xs text-slate-400 mt-1">Price tracker is scanning Flipkart and Amazon feeds.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Price History Tracker</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare price movements and seasonal discount trends across stores
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '30' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            1M
          </button>
          <button
            onClick={() => setTimeRange('90')}
            className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '90' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            3M
          </button>
          <button
            onClick={() => setTimeRange('180')}
            className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '180' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            6M
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            All
          </button>
        </div>
      </div>

      {/* Stats Overview Pill Boxes */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700">
            <TrendingDown className="w-3.5 h-3.5" /> All-Time Low
          </div>
          <div className="text-base font-black text-emerald-900 mt-0.5">
            ₹{stats.allTimeLow ? stats.allTimeLow.toLocaleString('en-IN') : 'N/A'}
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-700">
            <TrendingUp className="w-3.5 h-3.5" /> All-Time High
          </div>
          <div className="text-base font-black text-rose-900 mt-0.5">
            ₹{stats.allTimeHigh ? stats.allTimeHigh.toLocaleString('en-IN') : 'N/A'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600">
            <Calendar className="w-3.5 h-3.5" /> Average Price
          </div>
          <div className="text-base font-black text-slate-800 mt-0.5">
            ₹{stats.averagePrice ? stats.averagePrice.toLocaleString('en-IN') : 'N/A'}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Line
              type="monotone"
              name="Flipkart"
              dataKey="flipkartPrice"
              stroke="#2874f0"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1, fill: '#2874f0' }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              name="Amazon"
              dataKey="amazonPrice"
              stroke="#ff9900"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1, fill: '#ff9900' }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>💡 Tip: Prices are checked continuously across verified merchant listings.</span>
        <span>{formattedChartData.length} data records</span>
      </div>
    </div>
  );
};

export default PriceChart;
