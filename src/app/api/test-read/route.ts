import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database read...');

    // Try to read from clients table
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Read error:', error);
      return NextResponse.json({ 
        error: 'Read failed', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Test read error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
