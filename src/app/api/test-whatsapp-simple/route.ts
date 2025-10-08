import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing WhatsApp sending...');
    
    const result = await sendWhatsApp({
      to: '+972546093624',
      template: 'admin_new_order',
      variables: {
        orderId: 'TEST123',
        clientName: 'Test Client',
        itemCount: 1
      }
    });

    console.log('📤 WhatsApp send result:', result);

    return NextResponse.json({
      success: true,
      result,
      message: 'WhatsApp test completed - check console logs'
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


