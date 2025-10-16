import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateHebrewSearch } from '@/lib/hebrew-search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [], clients: [] });
    }

    // Translate Hebrew search terms to English equivalents
    const searchTerms = translateHebrewSearch(query);
    
    console.log('Search query:', query);
    console.log('Translated search terms:', searchTerms);

    // Build search conditions for all translated terms
    const productSearchConditions = searchTerms.map(term => {
      const searchTerm = `%${term}%`;
      return `brand.ilike.${searchTerm},model.ilike.${searchTerm},storage.ilike.${searchTerm},category.ilike.${searchTerm}`;
    }).join(',');

    // Search products with Hebrew and English terms
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
        sale_price_default,
        purchase_price
      `)
      .or(productSearchConditions)
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
      .limit(20);

    if (productsError) {
      console.error('Error searching products:', productsError);
    }

    // Remove duplicates (products matched by multiple search terms)
    const uniqueProducts = products ? 
      Array.from(new Map(products.map(p => [p.id, p])).values()) : 
      [];

    // Search clients (Hebrew names too)
    const clientSearchConditions = searchTerms.map(term => {
      const searchTerm = `%${term}%`;
      return `name.ilike.${searchTerm},phone.ilike.${searchTerm},shop_name.ilike.${searchTerm},city.ilike.${searchTerm}`;
    }).join(',');

    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select(`
        id,
        name,
        phone,
        address,
        shop_name,
        city,
        email
      `)
      .or(clientSearchConditions)
      .order('name', { ascending: true })
      .limit(10);

    if (clientsError) {
      console.error('Error searching clients:', clientsError);
    }

    // Remove duplicate clients
    const uniqueClients = clients ? 
      Array.from(new Map(clients.map(c => [c.id, c])).values()) : 
      [];

    return NextResponse.json({
      products: uniqueProducts,
      clients: uniqueClients,
      searchTermsUsed: searchTerms, // Debug info
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
