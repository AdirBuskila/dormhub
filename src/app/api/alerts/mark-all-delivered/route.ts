import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const { error } = await supabaseAdmin
      .from('alerts')
      .update({ delivered: true })
      .eq('delivered', false);

    if (error) {
      console.error('Error marking all alerts as delivered:', error);
      return NextResponse.json(
        { error: 'Failed to mark all alerts as delivered' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all delivered error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}