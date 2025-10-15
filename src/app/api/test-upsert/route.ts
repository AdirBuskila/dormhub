import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing upsert operation...');
    
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
    
    // Test upsert with the exact same data structure as the real API
    const { data, error } = await supabase
      .from('clients')
      .upsert({
        id: body.userId || 'test-user-123',
        name: body.shop_name || 'Test Shop',
        phone: body.phone || '050-1234567',
        address: body.city || 'Test City',
        payment_terms: 'on_delivery',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      }, { status: 500 });
    }
    
    console.log('Upsert successful:', data);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Upsert successful!'
    });
    
  } catch (error) {
    console.error('Test upsert error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
