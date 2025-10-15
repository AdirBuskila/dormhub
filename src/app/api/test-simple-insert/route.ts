import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple insert test started');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Try a very simple insert
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        id: 'test-user-123',
        name: 'Test User',
        phone: '050-1234567',
        address: 'Test City',
        payment_terms: 'on_delivery',
      })
      .select()
      .single();

    if (error) {
      console.error('Simple insert error:', error);
      return NextResponse.json({ 
        error: 'Insert failed', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Simple insert test error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
