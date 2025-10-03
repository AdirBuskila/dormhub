import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test basic tables
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('count')
      .limit(1);

    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('count')
      .limit(1);

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('count')
      .limit(1);

    // Test new tables (from migration)
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('alerts')
      .select('count')
      .limit(1);

    const { data: outboundMessages, error: outboundError } = await supabaseAdmin
      .from('outbound_messages')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      tables: {
        products: { exists: !productsError, error: productsError?.message },
        clients: { exists: !clientsError, error: clientsError?.message },
        orders: { exists: !ordersError, error: ordersError?.message },
        alerts: { exists: !alertsError, error: alertsError?.message },
        outbound_messages: { exists: !outboundError, error: outboundError?.message }
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}