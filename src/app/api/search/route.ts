import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [], clients: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    // Search products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        brand,
        model,
        storage,
        condition,
        category,
        total_stock,
        reserved_stock,
        min_stock_alert,
        image_url,
        is_promotion,
        tags,
        sale_price_default
      `)
      .or(`brand.ilike.${searchTerm},model.ilike.${searchTerm},storage.ilike.${searchTerm}`)
      .limit(10);

    if (productsError) {
      console.error('Error searching products:', productsError);
    }

    // Search clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select(`
        id,
        name,
        phone,
        address
      `)
      .or(`name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
      .limit(10);

    if (clientsError) {
      console.error('Error searching clients:', clientsError);
    }

    return NextResponse.json({
      products: products || [],
      clients: clients || [],
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
