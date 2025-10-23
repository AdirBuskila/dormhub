import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// POST - Submit a report
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const supabase = getSupabaseClient();
    
    const body = await request.json();
    const { reported_item_type, reported_item_id, reason, description } = body;

    // Validate input
    if (!reported_item_type || !reported_item_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate item type
    const validTypes = ['listing', 'tip', 'event'];
    if (!validTypes.includes(reported_item_type)) {
      return NextResponse.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    // Check if user already reported this item
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.profileId)
      .eq('reported_item_type', reported_item_type)
      .eq('reported_item_id', reported_item_id)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this item' },
        { status: 400 }
      );
    }

    // Create report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.profileId,
        reported_item_type,
        reported_item_id,
        reason,
        description,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Report submission error:', error);
    
    if (error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

