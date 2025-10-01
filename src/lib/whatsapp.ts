import { supabaseAdmin } from './supabase';

/**
 * WhatsApp Service Configuration
 * 
 * Environment variables needed for production:
 * - WHATSAPP_PROVIDER: 'meta' | 'twilio'
 * - WHATSAPP_API_KEY: Your API key from provider
 * - WHATSAPP_PHONE_NUMBER_ID: Your WhatsApp Business Phone Number ID (Meta) or From number (Twilio)
 * - WHATSAPP_API_URL: Provider API endpoint
 */

export type WhatsAppTemplate = 
  | 'order_confirmation'
  | 'order_delivered'
  | 'payment_reminder'
  | 'low_stock_notification'
  | 'return_approved';

export interface WhatsAppMessage {
  to: string; // Phone number in E.164 format (+1234567890)
  template: WhatsAppTemplate;
  payload: Record<string, any>;
}

export interface OutboundMessage {
  id: string;
  channel: 'whatsapp';
  to_client_id: string | null;
  template: string;
  payload: Record<string, any>;
  sent: boolean;
  created_at: string;
}

/**
 * Send WhatsApp message (stub implementation)
 * 
 * MVP: Records message in database and logs to console
 * Production: Uncomment the provider-specific HTTP call
 * 
 * @param message WhatsApp message details
 * @returns Success status
 */
export async function sendWhatsApp(message: WhatsAppMessage): Promise<boolean> {
  try {
    // Log message for development
    console.log('📱 WhatsApp Message (STUB):', {
      to: message.to,
      template: message.template,
      payload: message.payload,
      timestamp: new Date().toISOString()
    });

    // Record in outbound_messages table
    const { error } = await supabaseAdmin
      .from('outbound_messages')
      .insert({
        channel: 'whatsapp',
        to_client_id: message.payload.clientId || null,
        template: message.template,
        payload: message.payload,
        sent: false // Mark as false for now; will be true when actual send happens
      });

    if (error) throw error;

    // TODO: Uncomment and implement when ready for production
    /*
    const provider = process.env.WHATSAPP_PROVIDER;
    
    if (provider === 'meta') {
      return await sendViaMeta(message);
    } else if (provider === 'twilio') {
      return await sendViaTwilio(message);
    } else {
      console.warn('WhatsApp provider not configured');
      return false;
    }
    */

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

/**
 * Send order confirmation via WhatsApp
 */
export async function sendOrderConfirmation(params: {
  clientId: string;
  clientPhone: string;
  orderId: string;
  orderNumber: string;
  items: Array<{ product: string; quantity: number }>;
  total: number;
}): Promise<boolean> {
  return await sendWhatsApp({
    to: params.clientPhone,
    template: 'order_confirmation',
    payload: {
      clientId: params.clientId,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      items: params.items,
      total: params.total,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Send payment reminder via WhatsApp
 */
export async function sendPaymentReminder(params: {
  clientId: string;
  clientPhone: string;
  clientName: string;
  outstandingBalance: number;
  daysOverdue: number;
}): Promise<boolean> {
  return await sendWhatsApp({
    to: params.clientPhone,
    template: 'payment_reminder',
    payload: {
      clientId: params.clientId,
      clientName: params.clientName,
      outstandingBalance: params.outstandingBalance,
      daysOverdue: params.daysOverdue,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Get pending outbound messages
 */
export async function getPendingMessages(limit: number = 50): Promise<OutboundMessage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('outbound_messages')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending messages:', error);
    return [];
  }
}

/**
 * Mark message as sent
 */
export async function markMessageSent(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('outbound_messages')
      .update({ sent: true })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as sent:', error);
    return false;
  }
}

// ============================================================================
// PRODUCTION IMPLEMENTATIONS (commented out for MVP)
// ============================================================================

/**
 * Send message via Meta (Facebook) WhatsApp Business API
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/
 */
/*
async function sendViaMeta(message: WhatsAppMessage): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!phoneNumberId || !apiKey) {
    throw new Error('Meta WhatsApp credentials not configured');
  }

  const response = await fetch(
    `${apiUrl}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to,
        type: 'template',
        template: {
          name: message.template,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: Object.entries(message.payload).map(([key, value]) => ({
                type: 'text',
                text: String(value)
              }))
            }
          ]
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Meta WhatsApp API error:', error);
    return false;
  }

  return true;
}
*/

/**
 * Send message via Twilio WhatsApp API
 * Docs: https://www.twilio.com/docs/whatsapp/api
 */
/*
async function sendViaTwilio(message: WhatsAppMessage): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.WHATSAPP_PHONE_NUMBER_ID; // Twilio WhatsApp number

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio WhatsApp credentials not configured');
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:${message.to}`,
        Body: formatMessageBody(message.template, message.payload)
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Twilio WhatsApp API error:', error);
    return false;
  }

  return true;
}

function formatMessageBody(template: WhatsAppTemplate, payload: Record<string, any>): string {
  // Format message based on template
  switch (template) {
    case 'order_confirmation':
      return `Order confirmed! #${payload.orderNumber}. Total: $${payload.total}. We'll deliver soon!`;
    case 'payment_reminder':
      return `Hi ${payload.clientName}, you have an outstanding balance of $${payload.outstandingBalance}. Please settle at your earliest convenience.`;
    default:
      return JSON.stringify(payload);
  }
}
*/
