import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, city, shop_name } = body;

    if (!phone || !city || !shop_name) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, city, shop_name' },
        { status: 400 }
      );
    }

    // Upsert client record
    const { data, error } = await supabaseAdmin
      .from('clients')
      .upsert({
        id: userId, // Use Clerk userId as client ID
        name: shop_name,
        phone,
        address: city,
        payment_terms: 'on_delivery',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting client:', error);
      return NextResponse.json(
        { error: 'Failed to save client profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      client: data 
    });
  } catch (error) {
    console.error('Client upsert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
