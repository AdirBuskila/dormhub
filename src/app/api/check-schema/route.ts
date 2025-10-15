import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking database schema...');
    
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
    
    // Check if clients table exists and get its structure
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'clients');
    
    if (tablesError) {
      console.error('Tables query error:', tablesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query tables',
        details: tablesError.message
      }, { status: 500 });
    }
    
    console.log('Tables found:', tables);
    
    // Check columns in clients table
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'clients')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('Columns query error:', columnsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query columns',
        details: columnsError.message
      }, { status: 500 });
    }
    
    console.log('Columns found:', columns);
    
    // Try to get a sample record
    const { data: sample, error: sampleError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Sample query error:', sampleError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query sample data',
        details: sampleError.message
      }, { status: 500 });
    }
    
    console.log('Sample data:', sample);
    
    return NextResponse.json({
      success: true,
      tables: tables,
      columns: columns,
      sample: sample,
      message: 'Schema check successful!'
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
