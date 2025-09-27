import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check if we can read from products table
    const { data: products, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (readError) {
      return NextResponse.json({
        status: 'error',
        message: 'Cannot read from products table',
        error: readError.message,
        code: readError.code
      });
    }

    // Test 2: Try to insert a test product
    const testProduct = {
      brand: 'Test',
      model: 'Test Model',
      storage: '128GB',
      condition: 'new' as const,
      category: 'phone' as const,
      stock: 1,
      min_stock_alert: 5
    };

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        status: 'error',
        message: 'Cannot insert into products table',
        error: insertError.message,
        code: insertError.code,
        productsCount: products?.length || 0
      });
    }

    // Test 3: Clean up the test product
    await supabase
      .from('products')
      .delete()
      .eq('id', insertedProduct.id);

    return NextResponse.json({
      status: 'success',
      message: 'Database operations working correctly',
      productsCount: products?.length || 0,
      testInsert: 'successful'
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
