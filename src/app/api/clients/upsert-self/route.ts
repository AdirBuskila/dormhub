import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Upsert-self API called');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const authResult = await auth();
    console.log('Auth result:', authResult);
    
    const { userId } = authResult;
    
    if (!userId) {
      console.log('No userId found in auth result');
      return NextResponse.json(
        { error: 'Unauthorized - no userId found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, city, shop_name } = body;

    console.log('Upsert client request:', { userId, phone, city, shop_name });

    if (!phone || !city || !shop_name) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, city, shop_name' },
        { status: 400 }
      );
    }

    // Upsert client record - use clerk_user_id field
    const { data, error } = await supabaseAdmin
      .from('clients')
      .upsert({
        clerk_user_id: userId, // Use Clerk userId in the correct field
        name: shop_name,
        phone,
        address: city, // Keep address for backward compatibility
        city: city, // Also set city field
        shop_name: shop_name, // Also set shop_name field
        payment_terms: 'on_delivery',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_user_id' // Conflict on clerk_user_id instead of id
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting client:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to save client profile', details: error.message },
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
