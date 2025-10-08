/**
 * Check client phone numbers in database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== Client Phone Number Check ===\n');

  // Get all clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, email, phone, clerk_user_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (clientsError) {
    console.error('❌ Error fetching clients:', clientsError);
    return;
  }

  console.log(`Found ${clients?.length || 0} clients:\n`);
  
  clients?.forEach((client, idx) => {
    console.log(`${idx + 1}. ${client.name || 'Unnamed'}`);
    console.log(`   Email: ${client.email || 'N/A'}`);
    console.log(`   Phone: ${client.phone || '❌ NO PHONE NUMBER'}`);
    console.log(`   Clerk ID: ${client.clerk_user_id?.slice(0, 12)}...`);
    console.log('');
  });

  // Check recent outbound messages
  console.log('\n=== Recent WhatsApp Messages (Last 5) ===\n');
  const { data: messages, error: messagesError } = await supabase
    .from('outbound_messages')
    .select('*')
    .eq('channel', 'whatsapp')
    .order('created_at', { ascending: false })
    .limit(5);

  if (messagesError) {
    console.error('❌ Error fetching messages:', messagesError);
    return;
  }

  if (!messages || messages.length === 0) {
    console.log('No WhatsApp messages found in outbound_messages table');
  } else {
    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}. ${msg.template || 'Unknown template'}`);
      console.log(`   To: ${msg.to_phone}`);
      console.log(`   Sent: ${msg.sent ? '✓ YES' : '❌ NO (queued)'}`);
      console.log(`   Error: ${msg.error || 'None'}`);
      console.log(`   Created: ${new Date(msg.created_at).toLocaleString()}`);
      console.log('');
    });
  }

  console.log('\n=== Recommendations ===\n');
  
  const clientsWithoutPhone = clients?.filter(c => !c.phone) || [];
  if (clientsWithoutPhone.length > 0) {
    console.log(`⚠️  ${clientsWithoutPhone.length} client(s) without phone numbers`);
    console.log('   To receive WhatsApp messages, add phone numbers to clients table');
    console.log('   Format: E.164 (example: +972501234567)\n');
    console.log('   You can update via Supabase SQL:');
    console.log(`   UPDATE clients SET phone = '+972XXXXXXXXX' WHERE id = 'client_id_here';\n`);
  } else {
    console.log('✓ All clients have phone numbers!');
  }

  console.log('\n📋 To add/update your phone number:');
  console.log('   1. Go to Supabase SQL Editor');
  console.log('   2. Find your client record (check email or name)');
  console.log('   3. Run: UPDATE clients SET phone = \'+972XXXXXXXXX\' WHERE email = \'your@email.com\';');
  console.log('   4. Make sure the number is in E.164 format (+country_code + number)');
  console.log('\n');
}

main().catch(console.error);

