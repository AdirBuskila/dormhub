import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing production database connection...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service key exists:', !!serviceRoleKey);
    
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
    
    // Test 1: Check if we can read from clients table
    console.log('Test 1: Reading from clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, phone, city, shop_name')
      .limit(5);
    
    if (clientsError) {
      console.error('Clients read error:', clientsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to read from clients table',
        details: clientsError.message,
        code: clientsError.code,
        hint: clientsError.hint
      }, { status: 500 });
    }
    
    console.log('Clients read successful:', clients);
    
    // Test 2: Check if we can read from products table (since you said this works in production)
    console.log('Test 2: Reading from products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, brand, model, stock_quantity')
      .limit(5);
    
    if (productsError) {
      console.error('Products read error:', productsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to read from products table',
        details: productsError.message,
        code: productsError.code,
        hint: productsError.hint
      }, { status: 500 });
    }
    
    console.log('Products read successful:', products);
    
    // Test 3: Try a simple insert to clients table
    console.log('Test 3: Testing insert to clients table...');
    const testId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert({
        id: testId,
        name: 'Test Client',
        phone: '050-1234567',
        address: 'Test Address',
        payment_terms: 'on_delivery',
        city: 'Test City',
        shop_name: 'Test Shop'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert to clients table',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      }, { status: 500 });
    }
    
    console.log('Insert successful:', insertData);
    
    // Clean up test record
    await supabase
      .from('clients')
      .delete()
      .eq('id', testId);
    
    return NextResponse.json({
      success: true,
      clients: clients,
      products: products,
      message: 'Production database connection successful!'
    });
    
  } catch (error) {
    console.error('Production DB test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
