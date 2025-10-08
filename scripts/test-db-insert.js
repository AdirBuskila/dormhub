/**
 * Test database inserts to understand the structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabaseInserts() {
  try {
    console.log('🧪 Testing database inserts...');
    
    // Test 1: Try to insert a new_order alert
    console.log('\n1️⃣ Testing new_order alert insert:');
    const { data: alertData, error: alertError } = await supabase
      .from('alerts')
      .insert({
        type: 'new_order',
        ref_id: '00000000-0000-0000-0000-000000000000',
        message: 'Test new order alert',
        severity: 'info'
      })
      .select();
    
    if (alertError) {
      console.log('❌ Alert insert error:', alertError);
    } else {
      console.log('✅ Alert inserted successfully:', alertData);
    }
    
    // Test 2: Try to insert an outbound message
    console.log('\n2️⃣ Testing outbound message insert:');
    const { data: messageData, error: messageError } = await supabase
      .from('outbound_messages')
      .insert({
        channel: 'whatsapp',
        to_client_id: null,
        to_phone: '+972546093624',
        template: 'admin_new_order',
        payload: { test: true },
        sent: false
      })
      .select();
    
    if (messageError) {
      console.log('❌ Message insert error:', messageError);
    } else {
      console.log('✅ Message inserted successfully:', messageData);
    }
    
    // Test 3: Check what columns actually exist
    console.log('\n3️⃣ Checking actual table structure:');
    
    // Try to select from alerts with specific columns
    const { data: alertsSample, error: alertsError } = await supabase
      .from('alerts')
      .select('id, type, ref_id, message, severity, delivered, created_at')
      .limit(1);
    
    if (alertsError) {
      console.log('❌ Alerts select error:', alertsError);
    } else {
      console.log('✅ Alerts columns work:', alertsSample);
    }
    
    // Try to select from outbound_messages with specific columns
    const { data: messagesSample, error: messagesError } = await supabase
      .from('outbound_messages')
      .select('id, channel, to_client_id, to_phone, template, payload, sent, sent_at, error, created_at')
      .limit(1);
    
    if (messagesError) {
      console.log('❌ Messages select error:', messagesError);
    } else {
      console.log('✅ Messages columns work:', messagesSample);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseInserts();




