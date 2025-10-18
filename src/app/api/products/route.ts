import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/database';

// Cache products for 5 minutes (they don't change often)
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
