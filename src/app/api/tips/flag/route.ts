import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tip_id, reason, details } = body;

    if (!tip_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if user already flagged this tip
    const { data: existingFlag } = await supabase
      .from('tip_flags')
      .select('id')
      .eq('reporter_id', user.profileId)
      .eq('tip_id', tip_id)
      .eq('status', 'pending')
      .single();

    if (existingFlag) {
      return NextResponse.json(
        { error: 'You have already reported this tip' },
        { status: 400 }
      );
    }

    // Create flag
    const { data: flag, error: flagError } = await supabase
      .from('tip_flags')
      .insert({
        tip_id,
        reporter_id: user.profileId,
        reason,
        details: details || null,
        status: 'pending',
      })
      .select()
      .single();

    if (flagError) throw flagError;

    return NextResponse.json({ success: true, flag });
  } catch (error) {
    console.error('Error flagging tip:', error);
    return NextResponse.json(
      { error: 'Failed to flag tip' },
      { status: 500 }
    );
  }
}

