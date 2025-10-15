import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('alerts')
      .update({ delivered: true })
      .eq('id', alertId);

    if (error) {
      console.error('Error marking alert as delivered:', error);
      return NextResponse.json(
        { error: 'Failed to mark alert as delivered' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark delivered error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}