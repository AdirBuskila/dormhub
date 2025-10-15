import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;

    console.log('Testing client API for ID:', clientId);

    // Find client by id (since user_id column doesn't exist)
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return NextResponse.json({ 
        error: 'Client not found',
        details: error.message,
        searchedFor: clientId
      }, { status: 404 });
    }

    // Check profile completeness - use basic fields for now
    const isProfileComplete = client.phone && client.address && client.name;

    return NextResponse.json({
      client,
      isProfileComplete,
      missingFields: {
        phone: !client.phone,
        address: !client.address,
        name: !client.name
      }
    });
  } catch (error) {
    console.error('Error in GET /api/test-client/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
