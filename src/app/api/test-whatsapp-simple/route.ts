import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing WhatsApp sending...');
    
    // Test new order notification with detailed items
    const newOrderResult = await sendWhatsApp({
      to: '+972546093624',
      template: 'admin_new_order',
      variables: {
        orderId: 'TEST123',
        clientName: 'Test Client',
        itemCount: 3,
        itemsSummary: '2× Apple iPhone 15 Pro 256GB\n1× Samsung Galaxy S24 128GB'
      }
    });

    console.log('📤 New Order WhatsApp result:', newOrderResult);

    // Test low stock notification
    const lowStockResult = await sendWhatsApp({
      to: '+972546093624',
      template: 'admin_low_stock',
      variables: {
        productName: 'iPhone 15 Pro 256GB',
        currentStock: 2,
        minAlert: 5
      }
    });

    console.log('📤 Low Stock WhatsApp result:', lowStockResult);

    return NextResponse.json({
      success: true,
      results: {
        newOrder: newOrderResult,
        lowStock: lowStockResult
      },
      message: 'WhatsApp tests completed - check console logs and your phone!'
    });

  } catch (error) {
    console.error('❌ WhatsApp test error:', error);
    return NextResponse.json(
      { 
        error: 'WhatsApp test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}


