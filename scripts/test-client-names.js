/**
 * Test script to check if client names are being retrieved properly
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testClientNames() {
  console.log('🧪 Testing Client Name Retrieval\n');

  // Test the exact query from getOrdersToDeliver
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      promised_date,
      created_at,
      total_price,
      client:clients(name)
    `)
    .in('status', ['draft', 'reserved'])
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📋 Orders with Client Data:');
  data?.forEach((order, idx) => {
    console.log(`\n${idx + 1}. Order #${order.id.slice(0, 8)}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Client data:`, JSON.stringify(order.client, null, 2));
    
    const client = order.client;
    const clientName = Array.isArray(client) ? client[0]?.name : client?.name;
    console.log(`   Extracted name: "${clientName || 'NULL/UNDEFINED'}"`);
  });

  // Also check if clients have names in the database
  console.log('\n\n📋 All Clients in Database:');
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, email')
    .order('created_at', { ascending: false })
    .limit(10);

  if (clientsError) {
    console.error('❌ Error fetching clients:', clientsError);
    return;
  }

  clients?.forEach((client, idx) => {
    console.log(`${idx + 1}. ${client.name || 'NO NAME'} (${client.email})`);
  });

  console.log('\n');
}

testClientNames().catch(console.error);

