import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all active hot deals (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Fetch all active hot deals with business information
    const { data: hotDeals, error } = await supabaseAdmin
      .from('hot_deals')
      .select(`
        *,
        business:businesses(
          id,
          name,
          category,
          logo_url,
          phone,
          address,
          whatsapp,
          business_hours(*)
        )
      `)
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching hot deals:', error);
      return NextResponse.json({ error: 'Failed to fetch hot deals' }, { status: 500 });
    }

    // Filter out deals from inactive businesses
    const activeDeals = hotDeals?.filter(deal => deal.business) || [];

    return NextResponse.json({ hotDeals: activeDeals });
  } catch (error) {
    console.error('Fetch hot deals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

