/**
 * Check recent orders and their WhatsApp messages
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== Recent Orders & WhatsApp Messages ===\n');

  // Get recent orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      clients!inner(name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('❌ Error fetching orders:', ordersError);
    return;
  }

  console.log(`Last 5 orders:\n`);
  
  orders?.forEach((order, idx) => {
    const client = Array.isArray(order.clients) ? order.clients[0] : order.clients;
    console.log(`${idx + 1}. Order #${order.id.slice(0, 8)}`);
    console.log(`   Client: ${client?.name || 'Unknown'}`);
    console.log(`   Phone: ${client?.phone || '❌ NO PHONE'}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
    console.log('');
  });

  // Get recent WhatsApp messages
  console.log('\n=== Recent WhatsApp Messages (Last 10) ===\n');
  const { data: messages, error: messagesError } = await supabase
    .from('outbound_messages')
    .select('*')
    .eq('channel', 'whatsapp')
    .order('created_at', { ascending: false })
    .limit(10);

  if (messagesError) {
    console.error('❌ Error fetching messages:', messagesError);
    return;
  }

  if (!messages || messages.length === 0) {
    console.log('No WhatsApp messages found');
  } else {
    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}. ${msg.template || 'Unknown template'}`);
      console.log(`   To: ${msg.to_phone}`);
      console.log(`   Sent: ${msg.sent ? '✅ YES' : '⏳ QUEUED'}`);
      if (msg.error) console.log(`   Error: ❌ ${msg.error}`);
      console.log(`   Created: ${new Date(msg.created_at).toLocaleString()}`);
      if (msg.payload?.itemsSummary) {
        console.log(`   Items: ${msg.payload.itemsSummary}`);
      }
      console.log('');
    });
  }

  // Check for messages that should have been sent but weren't
  const recentTime = new Date();
  recentTime.setMinutes(recentTime.getMinutes() - 10); // Last 10 minutes

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, created_at')
    .gte('created_at', recentTime.toISOString());

  const { data: recentMessages } = await supabase
    .from('outbound_messages')
    .select('template')
    .eq('template', 'admin_new_order')
    .gte('created_at', recentTime.toISOString());

  console.log('\n=== Diagnostic Summary ===\n');
  console.log(`Orders created in last 10 minutes: ${recentOrders?.length || 0}`);
  console.log(`Admin WhatsApp messages in last 10 minutes: ${recentMessages?.length || 0}`);
  
  if ((recentOrders?.length || 0) > (recentMessages?.length || 0)) {
    console.log('\n⚠️  WARNING: Some orders may not have triggered WhatsApp messages!');
    console.log('   This could be due to:');
    console.log('   1. Code error in order creation');
    console.log('   2. WhatsApp service error');
    console.log('   3. Message was sent but not logged');
  } else if (recentOrders?.length === 0) {
    console.log('\n✓ No recent orders in the last 10 minutes');
  } else {
    console.log('\n✓ All recent orders have corresponding WhatsApp messages');
  }

  console.log('\n');
}

main().catch(console.error);

