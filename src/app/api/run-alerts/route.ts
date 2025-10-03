import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { runDailyAlerts } from '@/lib/alerts';
import { isAdminEmail } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAdminEmail(userEmail)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Run alerts
    const result = await runDailyAlerts();

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error in run-alerts API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}