import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if we're using placeholder keys
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder') || 
        supabaseUrl === '' || supabaseKey === '') {
      return NextResponse.json({
        status: 'setup_required',
        message: 'Database not configured. Please set up Supabase and update your .env.local file.',
        instructions: {
          step1: 'Go to https://supabase.com and create a new project',
          step2: 'Get your API keys from Settings → API',
          step3: 'Update .env.local with real Supabase keys',
          step4: 'Run the schema.sql file in Supabase SQL Editor',
          step5: 'Restart the app and add products'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist, that's expected for first run
      if (error.code === 'PGRST116' || error.message.includes('relation "products" does not exist')) {
        return NextResponse.json({
          status: 'warning',
          message: 'Database connected but tables not set up yet. Please run the schema.sql file in your Supabase dashboard.',
          timestamp: new Date().toISOString()
        });
      }
      
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      productCount: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
