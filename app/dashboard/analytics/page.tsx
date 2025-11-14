'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Zap, Activity, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsData {
  total_spent: number;
  total_generations: number;
  completed_generations: number;
  failed_generations: number;
  by_type: Record<string, number>;
  by_model: Record<string, number>;
  by_payment_method: Record<string, number>;
  recent_activity: Array<{
    date: string;
    generations: number;
    spent: number;
  }>;
}

const COLORS = ['#FF6B35', '#F7931E', '#FFC233', '#4ECDC4', '#9333EA', '#EC4899'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
        <p className="text-white font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && walletAddress) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [connected, walletAddress]);

  const fetchAnalytics = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?wallet=${walletAddress}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      setAnalytics(result.data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate savings vs subscriptions
  const calculateSavings = () => {
    if (!analytics) return 0;
    
    // Average subscription costs:
    // OpenAI Plus: $20/month
    // Midjourney: $10/month
    // Suno: $10/month
    // Average: $13.33/month
    const subscriptionCost = 13.33;
    const savings = subscriptionCost - analytics.total_spent;
    return savings;
  };

  if (!connected) {
    return (
      <div className="min-h-screen">
        <InteractiveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-20 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-6">Analytics Dashboard</h1>
              <p className="text-white/60 mb-8">Connect your wallet to view your analytics</p>
              <WalletMultiButton className="!bg-gradient-to-r !from-forge-orange !to-forge-red" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <InteractiveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-20 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-forge-orange to-forge-red rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-forge-orange border-r-forge-red mx-auto mb-6"></div>
              </div>
              <p className="text-white/80 text-lg font-medium">Loading analytics...</p>
              <p className="text-white/40 text-sm mt-2">Crunching the numbers</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <InteractiveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="px-6 py-3 bg-gradient-to-r from-forge-orange to-forge-red text-white rounded-lg hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.total_generations === 0) {
    return (
      <div className="min-h-screen">
        <InteractiveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-20 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-forge-orange/30 to-forge-red/30 rounded-full blur-3xl"></div>
                <div className="relative p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                  <Sparkles className="w-16 h-16 text-forge-orange" />
                </div>
              </div>
              <h1 className="text-5xl font-black text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                No Data Yet
              </h1>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                Start creating AI content to unlock your personalized analytics dashboard!
              </p>
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-forge-orange to-forge-red text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-forge-orange/30 transition-all duration-300 hover:scale-105"
              >
                <span>Start Creating</span>
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </a>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const typeData = Object.entries(analytics.by_type).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const modelData = Object.entries(analytics.by_model)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      generations: value
    }));

  const activityData = analytics.recent_activity
    .slice(0, 14)
    .reverse()
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      generations: item.generations,
      spent: item.spent
    }));

  const savings = calculateSavings();
  const successRate = analytics.total_generations > 0
    ? ((analytics.completed_generations / analytics.total_generations) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32 px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-6xl font-black text-white mb-6 tracking-tight">
                Analytics
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {/* Total Spent */}
              <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-default hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-white/40 text-xs font-medium tracking-wide">TOTAL SPENT</span>
                  <DollarSign className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                  ${analytics.total_spent.toFixed(2)}
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  {savings > 0 ? (
                    <>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span className="font-semibold">${savings.toFixed(2)}</span>
                      </div>
                      <span className="text-white/30">saved</span>
                    </>
                  ) : (
                    <span className="text-white/40">Start saving vs subscriptions</span>
                  )}
                </div>
              </div>

              {/* Total Generations */}
              <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-default hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-white/40 text-xs font-medium tracking-wide">GENERATIONS</span>
                  <Zap className="w-4 h-4 text-white/30 group-hover:text-forge-orange transition-colors duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                  {analytics.total_generations}
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  <span className="text-white/60 font-semibold">{analytics.completed_generations}</span>
                  <span className="text-white/30">completed</span>
                </div>
              </div>

              {/* Success Rate */}
              <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-default hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-white/40 text-xs font-medium tracking-wide">SUCCESS RATE</span>
                  <TrendingUp className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                  {successRate}%
                </div>
                <div className="text-sm">
                  {analytics.failed_generations > 0 ? (
                    <span className="text-white/40">{analytics.failed_generations} failed</span>
                  ) : (
                    <span className="text-white/60">All successful</span>
                  )}
                </div>
              </div>

              {/* Avg Cost */}
              <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-default hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-white/40 text-xs font-medium tracking-wide">AVG COST</span>
                  <Activity className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                  ${(analytics.total_spent / analytics.total_generations).toFixed(3)}
                </div>
                <div className="text-sm text-white/40">
                  per generation
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">
              {/* Activity Over Time */}
              {activityData.length > 0 && (
                <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Activity</h3>
                        <p className="text-sm text-white/40">Last 14 days</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-white/30" />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={activityData}>
                        <defs>
                          <linearGradient id="colorGenerations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                        <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="generations"
                          stroke="#FF6B35"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorGenerations)"
                          name="Generations"
                        />
                        <Area
                          type="monotone"
                          dataKey="spent"
                          stroke="#4ECDC4"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSpent)"
                          name="Spent ($)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Content Type Breakdown */}
              {typeData.length > 0 && (
                <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Content Types</h3>
                        <p className="text-sm text-white/40">Distribution</p>
                      </div>
                      <Activity className="w-4 h-4 text-white/30" />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={100}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {typeData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Model Usage */}
            {modelData.length > 0 && (
              <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Top Models</h3>
                      <p className="text-sm text-white/40">Most used</p>
                    </div>
                    <Zap className="w-4 h-4 text-white/30" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modelData}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6B35" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#F7931E" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="generations" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Payment Methods</h3>
                    <p className="text-sm text-white/40">Preferred payment</p>
                  </div>
                  <DollarSign className="w-4 h-4 text-white/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analytics.by_payment_method).map(([method, count]) => (
                    <div 
                      key={method} 
                      className="bg-white/[0.03] border border-white/5 rounded-lg p-5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-white/40 uppercase text-[10px] font-medium tracking-wider">{method}</span>
                        <span className="text-3xl font-bold text-white tracking-tight">{count}</span>
                        <span className="text-white/30 text-xs">uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

