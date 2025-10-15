import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing simple insert...');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test simple insert (not upsert)
    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: `test-${Date.now()}`,
        name: body.shop_name || 'Test Shop',
        phone: body.phone || '050-1234567',
        address: body.city || 'Test City',
        payment_terms: 'on_delivery',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      }, { status: 500 });
    }
    
    console.log('Insert successful:', data);
    
    // Clean up
    await supabase
      .from('clients')
      .delete()
      .eq('id', data.id);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Insert successful!'
    });
    
  } catch (error) {
    console.error('Test insert error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
