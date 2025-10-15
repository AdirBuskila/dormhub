import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, notes } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabaseAdmin
      .from('consignments')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        client_id,
        product_id,
        quantity,
        notes,
        created_at,
        updated_at,
        product:products(brand, model, storage, image_url),
        client:clients(name)
      `)
      .single();

    if (error) {
      console.error('Error updating consignment:', error);
      return NextResponse.json(
        { error: 'Failed to update consignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Consignment PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('consignments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting consignment:', error);
      return NextResponse.json(
        { error: 'Failed to delete consignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Consignment DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
