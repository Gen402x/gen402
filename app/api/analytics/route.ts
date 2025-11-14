import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Use the helper function to get comprehensive analytics
    const { data: analyticsData, error: functionError } = await supabaseAdmin
      .rpc('get_user_analytics', { wallet_address: wallet });

    if (functionError) {
      console.error('❌ Error calling get_user_analytics:', functionError);
      // Fallback to manual queries if function doesn't exist yet
      return await getFallbackAnalytics(wallet);
    }

    return NextResponse.json({
      success: true,
      data: analyticsData || {
        total_spent: 0,
        total_generations: 0,
        completed_generations: 0,
        failed_generations: 0,
        by_type: {},
        by_model: {},
        by_payment_method: {},
        recent_activity: []
      }
    });
  } catch (error: any) {
    console.error('❌ GET /api/analytics failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Fallback analytics if the SQL function doesn't exist yet
async function getFallbackAnalytics(wallet: string) {
  try {
    // Get all generations for this wallet
    const { data: generations, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('user_wallet', wallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching generations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch generation data' },
        { status: 500 }
      );
    }

    if (!generations || generations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_spent: 0,
          total_generations: 0,
          completed_generations: 0,
          failed_generations: 0,
          by_type: {},
          by_model: {},
          by_payment_method: {},
          recent_activity: []
        }
      });
    }

    // Calculate analytics
    const totalSpent = generations.reduce((sum, gen) => sum + parseFloat(gen.amount_usd || '0'), 0);
    const totalGenerations = generations.length;
    const completedGenerations = generations.filter(g => g.status === 'completed').length;
    const failedGenerations = generations.filter(g => g.status === 'failed').length;

    // Group by type
    const byType: Record<string, number> = {};
    generations.forEach(gen => {
      byType[gen.type] = (byType[gen.type] || 0) + 1;
    });

    // Group by model
    const byModel: Record<string, number> = {};
    generations.forEach(gen => {
      byModel[gen.model] = (byModel[gen.model] || 0) + 1;
    });

    // Group by payment method
    const byPaymentMethod: Record<string, number> = {};
    generations.forEach(gen => {
      byPaymentMethod[gen.payment_method] = (byPaymentMethod[gen.payment_method] || 0) + 1;
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentGens = generations.filter(g => new Date(g.created_at) >= thirtyDaysAgo);
    
    // Group by date
    const activityByDate: Record<string, { generations: number; spent: number }> = {};
    recentGens.forEach(gen => {
      const date = new Date(gen.created_at).toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = { generations: 0, spent: 0 };
      }
      activityByDate[date].generations += 1;
      activityByDate[date].spent += parseFloat(gen.amount_usd || '0');
    });

    const recentActivity = Object.entries(activityByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      success: true,
      data: {
        total_spent: totalSpent,
        total_generations: totalGenerations,
        completed_generations: completedGenerations,
        failed_generations: failedGenerations,
        by_type: byType,
        by_model: byModel,
        by_payment_method: byPaymentMethod,
        recent_activity: recentActivity
      }
    });
  } catch (error: any) {
    console.error('❌ Fallback analytics failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}

