/**
 * WhatsApp service with Twilio integration
 * This module must be server-only - no client-side usage
 */

import { createClient } from '@supabase/supabase-js';
import { OutboundMessage } from '@/types/database';

export type WhatsAppPayload = {
  to: string;
  template: string;
  variables?: Record<string, any>;
  toClientId?: string;
};

/**
 * Render a message template with variables
 */
export function renderTemplate(template: string, variables: Record<string, any>): string {
  switch (template) {
    case 'order_confirmation':
      return `Order #${variables.orderId || ''} received: ${variables.summary || ''}`;
    
    case 'delivery_notice':
      return `Order #${variables.orderId || ''} is on the way today.`;
    
    case 'payment_reminder':
      return `Reminder: invoice #${variables.invoiceId || 'N/A'} amount ${variables.amount || '0'} due ${variables.dueDate || ''}.`;
    
    case 'reserved_nudge':
      return `Order #${variables.orderId || ''} is waiting for pickup.`;
    
    default:
      // Generic template rendering - replace {{var}} with variables
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || '';
      });
  }
}

/**
 * Send WhatsApp message via Twilio or queue for later
 */
export async function sendWhatsApp(payload: WhatsAppPayload) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const renderedMessage = renderTemplate(payload.template, payload.variables || {});

  // Test mode - just log and queue
  if (process.env.WHATSAPP_TEST_MODE === 'true') {
    console.log('WhatsApp (TEST MODE):', {
      to: payload.to,
      template: payload.template,
      message: renderedMessage,
      variables: payload.variables
    });

    const { error } = await supabase
      .from('outbound_messages')
      .insert({
        channel: 'whatsapp',
        to_client_id: payload.toClientId || null,
        to_phone: payload.to,
        template: payload.template,
        payload: { ...payload.variables, rendered_message: renderedMessage },
        sent: false
      });

    if (error) {
      console.error('Failed to queue WhatsApp message:', error);
      return { queued: false, error: error.message };
    }

    return { queued: true };
  }

  // Twilio provider
  if (process.env.WHATSAPP_PROVIDER === 'twilio') {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Missing Twilio configuration');
      }

      // Send via Twilio API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: `whatsapp:${payload.to}`,
            Body: renderedMessage
          })
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Success - mark as sent
        const { error } = await supabase
          .from('outbound_messages')
          .insert({
            channel: 'whatsapp',
            to_client_id: payload.toClientId || null,
            to_phone: payload.to,
            template: payload.template,
            payload: { ...payload.variables, rendered_message: renderedMessage, twilio_sid: result.sid },
            sent: true,
            sent_at: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to record sent WhatsApp message:', error);
        }

        return { sent: true };
      } else {
        // Error - record failure
        const { error } = await supabase
          .from('outbound_messages')
          .insert({
            channel: 'whatsapp',
            to_client_id: payload.toClientId || null,
            to_phone: payload.to,
            template: payload.template,
            payload: { ...payload.variables, rendered_message: renderedMessage },
            sent: false,
            error: result.message || 'Unknown Twilio error'
          });

        if (error) {
          console.error('Failed to record failed WhatsApp message:', error);
        }

        return { sent: false, error: result.message || 'Unknown Twilio error' };
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      
      // Record the failure
      const { error: dbError } = await supabase
        .from('outbound_messages')
        .insert({
          channel: 'whatsapp',
          to_client_id: payload.toClientId || null,
          to_phone: payload.to,
          template: payload.template,
          payload: { ...payload.variables, rendered_message: renderedMessage },
          sent: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

      if (dbError) {
        console.error('Failed to record failed WhatsApp message:', dbError);
      }

      return { 
        sent: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Default: queue only
  const { error } = await supabase
    .from('outbound_messages')
    .insert({
      channel: 'whatsapp',
      to_client_id: payload.toClientId || null,
      to_phone: payload.to,
      template: payload.template,
      payload: { ...payload.variables, rendered_message: renderedMessage },
      sent: false
    });

  if (error) {
    console.error('Failed to queue WhatsApp message:', error);
    return { queued: false, error: error.message };
  }

  return { queued: true };
}