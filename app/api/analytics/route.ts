import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Get all generations for this wallet
    const { data: generations, error: generationsError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('user_wallet', wallet)
      .order('created_at', { ascending: false });

    if (generationsError) {
      console.error('Error fetching generations:', generationsError);
      return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 });
    }

    // Get refunds for money saved calculation
    const { data: refunds, error: refundsError } = await supabaseAdmin
      .from('refunds')
      .select('amount')
      .eq('user_wallet', wallet)
      .eq('status', 'success');

    if (refundsError) {
      console.error('Error fetching refunds:', refundsError);
    }

    // Process analytics
    const analytics = processAnalytics(generations || [], refunds || []);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processAnalytics(
  generations: any[],
  refunds: any[]
): AnalyticsData {
  // Calculate money saved from refunds
  const moneySaved = refunds.reduce((sum, refund) => sum + (refund.amount || 0), 0);

  // Basic stats
  const totalGenerations = generations.length;
  const completedGenerations = generations.filter((g) => g.status === 'completed').length;
  const failedGenerations = generations.filter((g) => g.status === 'failed').length;
  const totalSpent = generations.reduce((sum, g) => sum + (parseFloat(g.amount_usd) || 0), 0);

  // Calculate success rate
  const successRate = totalGenerations > 0
    ? (completedGenerations / totalGenerations) * 100
    : 100;

  // Calculate average cost
  const avgCost = totalGenerations > 0 ? totalSpent / totalGenerations : 0;

  // Activity data (last 14 days)
  const activityMap = new Map<string, { count: number; spent: number }>();
  generations.forEach((gen) => {
    const date = new Date(gen.created_at).toISOString().split('T')[0];
    const existing = activityMap.get(date) || { count: 0, spent: 0 };
    activityMap.set(date, {
      count: existing.count + 1,
      spent: existing.spent + parseFloat(gen.amount_usd),
    });
  });

  const activityData = Array.from(activityMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  // Content types distribution
  const contentTypeMap = new Map<string, number>();
  generations.forEach((gen) => {
    const type = gen.type || 'image';
    contentTypeMap.set(type, (contentTypeMap.get(type) || 0) + 1);
  });

  const contentTypes = Array.from(contentTypeMap.entries())
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: totalGenerations > 0 ? (count / totalGenerations) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Top models
  const modelMap = new Map<string, { count: number; spent: number }>();
  generations.forEach((gen) => {
    const modelName = gen.model_name || gen.model;
    const existing = modelMap.get(modelName) || { count: 0, spent: 0 };
    modelMap.set(modelName, {
      count: existing.count + 1,
      spent: existing.spent + parseFloat(gen.amount_usd),
    });
  });

  const topModels = Array.from(modelMap.entries())
    .map(([model, data]) => ({ model, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent activity
  const recentActivity = generations
    .slice(0, 10)
    .map((gen) => ({
      date: gen.created_at,
      type: gen.type,
      model: gen.model_name || gen.model,
      cost: parseFloat(gen.amount_usd),
      status: gen.status,
    }));

  return {
    totalSpent,
    moneySaved,
    totalGenerations,
    completedGenerations,
    failedGenerations,
    successRate,
    avgCost,
    activityData,
    contentTypes,
    topModels,
    recentActivity,
  };
}
