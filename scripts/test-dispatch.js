/**
 * Test message dispatch without authentication
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDispatch() {
  try {
    console.log('📤 Testing message dispatch...');
    
    // Fetch unsent messages
    const { data: messages, error: fetchError } = await supabase
      .from('outbound_messages')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('❌ Error fetching messages:', fetchError);
      return;
    }

    if (!messages || messages.length === 0) {
      console.log('ℹ️  No queued messages to process');
      return;
    }

    console.log(`📋 Found ${messages.length} queued messages`);

    // Process each message
    for (const message of messages) {
      console.log(`\n📨 Processing message ${message.id}:`);
      console.log(`   To: ${message.to_phone}`);
      console.log(`   Template: ${message.template}`);
      console.log(`   Payload:`, message.payload);
      
      // Simulate sending (since we're in test mode)
      const testMode = process.env.WHATSAPP_TEST_MODE === 'true';
      
      if (testMode) {
        console.log('   📝 TEST MODE: Message would be sent via Twilio');
        console.log('   📱 Message content:', message.payload.rendered_message);
        
        // Mark as sent in test mode
        const { error: updateError } = await supabase
          .from('outbound_messages')
          .update({
            sent: true,
            sent_at: new Date().toISOString(),
            error: null
          })
          .eq('id', message.id);
        
        if (updateError) {
          console.log('   ❌ Error updating message:', updateError);
        } else {
          console.log('   ✅ Message marked as sent (test mode)');
        }
      } else {
        console.log('   📱 PRODUCTION MODE: Would send via Twilio API');
        // In production, this would call the actual Twilio API
      }
    }

    console.log('\n🎉 Dispatch test completed!');
    
  } catch (error) {
    console.error('❌ Dispatch test failed:', error);
  }
}

// Run the test
testDispatch();




