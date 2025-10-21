import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function PUT(request: Request) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { 
      businessId,
      name,
      category,
      description,
      phone,
      address,
      website,
      whatsapp,
    } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify business ownership
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('owner_clerk_id')
      .eq('id', businessId)
      .single();

    if (fetchError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.owner_clerk_id !== user.clerkId) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this business' },
        { status: 403 }
      );
    }

    // Update business info
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        name: name || null,
        category: category || 'other',
        description: description || null,
        phone: phone || null,
        address: address || null,
        website: website || null,
        whatsapp: whatsapp || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update business information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
    });

  } catch (error) {
    console.error('Business info update error:', error);
    
    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating business information' },
      { status: 500 }
    );
  }
}


