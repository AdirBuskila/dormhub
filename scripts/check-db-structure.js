/**
 * Check database structure for alerts and outbound_messages tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check alerts table structure
    console.log('\n📊 Alerts table structure:');
    const { data: alertsColumns, error: alertsError } = await supabase
      .rpc('get_table_columns', { table_name: 'alerts' });
    
    if (alertsError) {
      console.log('❌ Error checking alerts table:', alertsError);
    } else {
      console.log(alertsColumns);
    }
    
    // Check outbound_messages table structure
    console.log('\n📨 Outbound_messages table structure:');
    const { data: messagesColumns, error: messagesError } = await supabase
      .rpc('get_table_columns', { table_name: 'outbound_messages' });
    
    if (messagesError) {
      console.log('❌ Error checking outbound_messages table:', messagesError);
    } else {
      console.log(messagesColumns);
    }
    
    // Try a simple query to see what columns exist
    console.log('\n🔍 Testing alerts table query:');
    const { data: alertsTest, error: alertsTestError } = await supabase
      .from('alerts')
      .select('*')
      .limit(1);
    
    if (alertsTestError) {
      console.log('❌ Alerts table error:', alertsTestError);
    } else {
      console.log('✅ Alerts table accessible');
    }
    
    console.log('\n🔍 Testing outbound_messages table query:');
    const { data: messagesTest, error: messagesTestError } = await supabase
      .from('outbound_messages')
      .select('*')
      .limit(1);
    
    if (messagesTestError) {
      console.log('❌ Outbound_messages table error:', messagesTestError);
    } else {
      console.log('✅ Outbound_messages table accessible');
    }
    
  } catch (error) {
    console.error('❌ Error checking database structure:', error);
  }
}

// Run the check
checkDatabaseStructure();




