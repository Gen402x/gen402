'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Zap,
  Target,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
} from 'lucide-react';

interface AnalyticsData {
  totalSpent: number;
  moneySaved: number;
  totalGenerations: number;
  completedGenerations: number;
  failedGenerations: number;
  successRate: number;
  avgCost: number;
  activityData: Array<{ date: string; count: number; spent: number }>;
  contentTypes: Array<{ type: string; count: number; percentage: number }>;
  topModels: Array<{ model: string; count: number; spent: number }>;
  recentActivity: Array<{
    date: string;
    type: string;
    model: string;
    cost: number;
    status: string;
  }>;
}

const COLORS = ['#FF6B2C', '#FF8F5C', '#FFB38C', '#FFD7BC', '#FFF4EC'];

export default function AnalyticsPage() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setAnalytics(null);
      return;
    }

    fetchAnalytics();
  }, [walletAddress]);

  const fetchAnalytics = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?wallet=${walletAddress}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen">
        <InteractiveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center pt-20">
            <div className="text-center space-y-6 px-8">
              <div className="w-20 h-20 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-forge-orange" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">Analytics Dashboard</h1>
                <p className="text-lg text-white/60 max-w-md">
                  Connect your wallet to see your personalized stats and usage analytics
                </p>
              </div>
              <WalletMultiButton className="!bg-white !text-black hover:!bg-white/90 !text-base !font-bold !py-4 !px-8 !rounded-full transition" />
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
          <main className="flex-1 flex items-center justify-center pt-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-forge-orange border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60">Loading your analytics...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen">
        <InteractiveBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center pt-20">
            <div className="text-center space-y-4 px-8">
              <p className="text-white/60">No analytics data available</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
              <p className="text-white/60">Your personal AI generation statistics</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Spent */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-forge-orange/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <DollarSign className="w-6 h-6 text-forge-orange" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-forge-orange" />
                </div>
                <div>
                  <p className="text-sm text-white/50 uppercase tracking-wider font-bold mb-1">
                    Total Spent
                  </p>
                  <p className="text-3xl font-bold text-white">
                    ${analytics.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-400 mt-2">
                    💰 ${analytics.moneySaved.toFixed(2)} saved
                  </p>
                </div>
              </div>

              {/* Generations */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/50 uppercase tracking-wider font-bold mb-1">
                    Generations
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {analytics.totalGenerations}
                  </p>
                  <p className="text-xs text-white/50 mt-2">
                    {analytics.completedGenerations} completed
                  </p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/50 uppercase tracking-wider font-bold mb-1">
                    Success Rate
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {analytics.successRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-white/50 mt-2">
                    All successful
                  </p>
                </div>
              </div>

              {/* Avg Cost */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/50 uppercase tracking-wider font-bold mb-1">
                    Avg Cost
                  </p>
                  <p className="text-3xl font-bold text-white">
                    ${analytics.avgCost.toFixed(3)}
                  </p>
                  <p className="text-xs text-white/50 mt-2">per generation</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Activity Chart */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 text-forge-orange" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Activity</h2>
                    <p className="text-sm text-white/50">Last 14 days</p>
                  </div>
                </div>
                {analytics.activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={analytics.activityData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.5)"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        labelStyle={{ color: '#fff', marginBottom: '8px' }}
                        itemStyle={{ color: '#FF6B2C' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#FF6B2C"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-white/40">
                    No activity data yet
                  </div>
                )}
              </div>

              {/* Content Types Pie Chart */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <PieChartIcon className="w-5 h-5 text-forge-orange" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Content Types</h2>
                    <p className="text-sm text-white/50">Distribution</p>
                  </div>
                </div>
                {analytics.contentTypes.length > 0 ? (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.contentTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: any) =>
                            `${props.type} ${props.percentage.toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.contentTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-white/40">
                    No content types yet
                  </div>
                )}
              </div>
            </div>

            {/* Top Models Chart */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-forge-orange" />
                <div>
                  <h2 className="text-xl font-bold text-white">Top Models</h2>
                  <p className="text-sm text-white/50">Most used</p>
                </div>
              </div>
              {analytics.topModels.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topModels}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="model"
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '12px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#FF6B2C" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-white/40">
                  No model usage yet
                </div>
              )}
            </div>

            {/* Recent Activity Table */}
            {analytics.recentActivity.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-forge-orange" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                    <p className="text-sm text-white/50">Latest generations</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-bold text-white/70 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-white/70 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-white/70 uppercase tracking-wider">
                          Model
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-white/70 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-white/70 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentActivity.map((activity, index) => (
                        <tr
                          key={index}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="py-3 px-4 text-sm text-white/80">
                            {new Date(activity.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forge-orange/10 text-forge-orange">
                              {activity.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-white/80">{activity.model}</td>
                          <td className="py-3 px-4 text-sm text-white/80">
                            ${activity.cost.toFixed(3)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.status === 'completed'
                                  ? 'bg-green-500/10 text-green-400'
                                  : activity.status === 'failed'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-yellow-500/10 text-yellow-400'
                              }`}
                            >
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}




