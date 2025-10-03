import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ unread: 0 }, { status: 200 });
    }

    // Check if user is admin
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAdminEmail(userEmail)) {
      return NextResponse.json({ unread: 0 }, { status: 200 });
    }

    // Get unread alerts count
    const { count } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('delivered', false);

    return NextResponse.json({ unread: count || 0 });

  } catch (error) {
    console.error('Error in alerts count API:', error);
    return NextResponse.json({ unread: 0 }, { status: 200 });
  }
}
