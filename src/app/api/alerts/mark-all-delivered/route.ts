import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Update all undelivered alerts as delivered
    const { data, error } = await supabase
      .from('alerts')
      .update({ delivered: true })
      .eq('delivered', false)
      .select('id');

    if (error) {
      console.error('Error marking all alerts as delivered:', error);
      return NextResponse.json({ error: 'Failed to update alerts' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: data?.length || 0 
    });

  } catch (error) {
    console.error('Error in mark-all-delivered API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to mark all alerts as delivered',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
