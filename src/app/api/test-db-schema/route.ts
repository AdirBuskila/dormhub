import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get table schema
    const { data: columns, error: schemaError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'clients')
      .order('ordinal_position');

    if (schemaError) {
      console.error('Error fetching schema:', schemaError);
      return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 });
    }

    // Try to get a sample client record
    const { data: sampleClient, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .limit(1);

    return NextResponse.json({
      columns,
      sampleClient: sampleClient?.[0] || null,
      clientError: clientError?.message || null
    });
  } catch (error) {
    console.error('Error in test-db-schema:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
