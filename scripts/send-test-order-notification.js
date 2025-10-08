/**
 * Test script to send WhatsApp notification for latest order
 * This runs locally by calling your local dev server API
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sendTestOrderNotification() {
  console.log('🧪 Testing WhatsApp Order Notification (LOCAL DEV)\n');

  // Get the latest order
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      clients!inner(name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(1);

  if (orderError || !orders || orders.length === 0) {
    console.error('❌ Error fetching latest order:', orderError);
    return;
  }

  const order = orders[0];
  const client = Array.isArray(order.clients) ? order.clients[0] : order.clients;

  console.log('📦 Latest Order Details:');
  console.log(`   Order ID: ${order.id}`);
  console.log(`   Short ID: ${order.id.slice(0, 8)}`);
  console.log(`   Client: ${client?.name || 'Unknown'}`);
  console.log(`   Status: ${order.status}`);
  console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
  console.log('');

  // Get order items with product details
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      quantity,
      products!inner(brand, model, storage)
    `)
    .eq('order_id', order.id);

  if (itemsError) {
    console.error('❌ Error fetching order items:', itemsError);
    return;
  }

  console.log('📋 Order Items:');
  const itemsSummary = orderItems?.map(item => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const itemText = `${item.quantity}× ${product?.brand || 'Unknown'} ${product?.model || ''} ${product?.storage || ''}`.trim();
    console.log(`   - ${itemText}`);
    return itemText;
  }).join('\n') || 'No items';
  console.log('');

  // Send via Twilio directly
  console.log('📤 Sending WhatsApp notification via Twilio...\n');

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const toNumber = process.env.ADMIN_PHONE || '+972546093624';

    if (!accountSid || !authToken || !fromNumber) {
      console.error('❌ Missing Twilio configuration in .env.local');
      console.log('   Required variables:');
      console.log('   - TWILIO_ACCOUNT_SID');
      console.log('   - TWILIO_AUTH_TOKEN');
      console.log('   - TWILIO_WHATSAPP_FROM');
      return;
    }

    // Build the message
    const message = `🆕 New Order Alert!

Order #${order.id.slice(0, 8)}
From: ${client?.name || 'Unknown Client'}

Items:
${itemsSummary}`;

    console.log('📝 Message to send:');
    console.log('-------------------');
    console.log(message);
    console.log('-------------------\n');

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
          To: `whatsapp:${toNumber}`,
          Body: message
        })
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! WhatsApp message sent!');
      console.log('   To:', toNumber);
      console.log('   From:', fromNumber);
      console.log('   Message SID:', result.sid);
      console.log('   Status:', result.status);
      console.log('\n💬 Check your WhatsApp now!\n');
      
      // Also log it in the database
      const { error: logError } = await supabase
        .from('outbound_messages')
        .insert({
          channel: 'whatsapp',
          to_phone: toNumber,
          template: 'admin_new_order',
          payload: {
            orderId: order.id.slice(0, 8),
            clientName: client?.name || 'Unknown Client',
            itemCount: orderItems?.length || 0,
            itemsSummary: itemsSummary,
            rendered_message: message,
            twilio_sid: result.sid
          },
          sent: true,
          sent_at: new Date().toISOString()
        });

      if (logError) {
        console.log('⚠️  Warning: Failed to log message in database:', logError.message);
      }
    } else {
      console.error('❌ Failed to send WhatsApp message');
      console.error('   Error:', result.message || result.error_message);
      console.error('   Code:', result.code);
      
      if (result.code === 21211) {
        console.log('\n⚠️  Phone number not in Twilio sandbox!');
        console.log('   Send "join home-caught" to +1 (415) 523-8886 first');
      }
    }

  } catch (error) {
    console.error('\n❌ Error sending WhatsApp:', error.message);
  }
}

sendTestOrderNotification().catch(console.error);
