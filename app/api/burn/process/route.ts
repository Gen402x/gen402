import { NextResponse } from 'next/server';
import { processPendingBurns, getBurnStats } from '@/lib/token-burn';

/**
 * API endpoint to process pending token burns
 * Can be called manually or set up as a cron job
 */
export async function POST(request: Request) {
  try {
    // Optional: Add authentication/API key check here
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.BURN_CRON_SECRET;
    
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔥 Starting burn processing job...');
    
    await processPendingBurns();
    
    const stats = getBurnStats();
    
    return NextResponse.json({
      success: true,
      message: 'Burn processing completed',
      stats,
    });
  } catch (error: any) {
    console.error('❌ Error in burn processing endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process burns' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check burn queue status
 */
export async function GET() {
  try {
    const stats = getBurnStats();
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

