import { NextResponse } from 'next/server';
import { runDailyAlerts } from '@/lib/alerts';

/**
 * Manual trigger for running daily alerts
 * For testing only - in production, use cron job
 */
export async function POST() {
  try {
    const results = await runDailyAlerts();

    return NextResponse.json({
      success: true,
      results,
      message: `Created ${results.total} new alerts`
    });
  } catch (error) {
    console.error('Error running alerts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
