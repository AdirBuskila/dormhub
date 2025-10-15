import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('delivered', false);

    if (error) {
      console.error('Error fetching alert count:', error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Alert count error:', error);
    return NextResponse.json({ count: 0 });
  }
}