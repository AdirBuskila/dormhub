import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, phone, city, shop_name } = body;

    console.log('Test insert with data:', { userId, phone, city, shop_name });

    // Try a simple insert first
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        id: userId,
        name: shop_name,
        phone,
        address: city,
        payment_terms: 'on_delivery',
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ 
        error: 'Insert failed', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Test insert error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
