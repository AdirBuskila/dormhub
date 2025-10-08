/**
 * Test WhatsApp sending directly with Twilio
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testWhatsAppDirect() {
  try {
    console.log('📱 Testing WhatsApp sending directly...');
    console.log('Environment check:');
    console.log('  WHATSAPP_TEST_MODE:', process.env.WHATSAPP_TEST_MODE);
    console.log('  WHATSAPP_PROVIDER:', process.env.WHATSAPP_PROVIDER);
    console.log('  TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set');
    console.log('  TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set');
    console.log('  TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM);
    console.log('  ADMIN_PHONE:', process.env.ADMIN_PHONE);
    
    // Test the actual WhatsApp service
    console.log('\n🔧 Testing WhatsApp service...');
    
    // Import the WhatsApp service
    const { sendWhatsApp } = require('../src/lib/whatsapp');
    
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
    
    // Check if message was created in database
    const { data: messages, error } = await supabase
      .from('outbound_messages')
      .select('*')
      .eq('to_phone', '+972546093624')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.log('❌ Error fetching messages:', error);
    } else if (messages && messages.length > 0) {
      console.log('✅ Latest message in database:', messages[0]);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWhatsAppDirect();


