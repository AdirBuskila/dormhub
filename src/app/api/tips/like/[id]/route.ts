import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tipId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('tip_votes')
      .select('*')
      .eq('user_id', user.profileId)
      .eq('tip_id', tipId)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted helpful' }, { status: 400 });
    }

    // Add vote
    const { error: voteError } = await supabase
      .from('tip_votes')
      .insert({
        user_id: user.profileId,
        tip_id: tipId,
      });

    if (voteError) throw voteError;

    // Increment helpful_count by fetching current value
    const { data: currentTip } = await supabase
      .from('tips')
      .select('helpful_count')
      .eq('id', tipId)
      .single();

    if (currentTip) {
      await supabase
        .from('tips')
        .update({ 
          helpful_count: currentTip.helpful_count + 1
        })
        .eq('id', tipId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting tip as helpful:', error);
    return NextResponse.json(
      { error: 'Failed to vote tip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tipId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Remove vote
    const { error: deleteError } = await supabase
      .from('tip_votes')
      .delete()
      .eq('user_id', user.profileId)
      .eq('tip_id', tipId);

    if (deleteError) throw deleteError;

    // Decrement helpful_count by fetching current value
    const { data: currentTip } = await supabase
      .from('tips')
      .select('helpful_count')
      .eq('id', tipId)
      .single();

    if (currentTip) {
      await supabase
        .from('tips')
        .update({ 
          helpful_count: Math.max(0, currentTip.helpful_count - 1)
        })
        .eq('id', tipId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing vote from tip:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
}

