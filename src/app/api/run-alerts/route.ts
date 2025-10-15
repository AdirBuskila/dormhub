import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { runDailyAlerts, checkLowStock, checkUndelivered, onNewOrder } from '@/lib/alerts';
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

    const body = await request.json();
    const { action, orderId } = body;

    let result;

    switch (action) {
      case 'low_stock':
        result = await checkLowStock();
        break;
      case 'undelivered':
        result = await checkUndelivered();
        break;
      case 'new_order':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required for new_order action' }, { status: 400 });
        }
        result = await onNewOrder(orderId);
        break;
      case 'all':
      default:
        result = await runDailyAlerts();
        break;
    }

    return NextResponse.json({
      success: true,
      action,
      result
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