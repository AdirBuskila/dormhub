import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/whatsapp';

/**
 * Test endpoint for WhatsApp functionality
 * For admin testing only - remove or protect before production
 */
export async function POST(request: NextRequest) {
  try {
    const { clientId, phone, template, payload } = await request.json();

    if (!phone || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, template' },
        { status: 400 }
      );
    }

    const success = await sendWhatsApp({
      to: phone,
      template,
      payload: {
        ...payload,
        clientId
      }
    });

    return NextResponse.json({
      success,
      message: success 
        ? 'WhatsApp message queued successfully (check console logs)'
        : 'Failed to queue WhatsApp message'
    });
  } catch (error) {
    console.error('Error in test-whatsapp:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
