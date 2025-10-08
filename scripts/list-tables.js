/**
 * List all tables in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  try {
    console.log('📋 Listing all tables...');
    
    // Try to get table information
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Error listing tables:', error);
    } else {
      console.log('✅ Tables found:');
      data.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Check if alerts table exists and get its structure
    console.log('\n🔍 Checking alerts table:');
    const { data: alertsData, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .limit(1);
    
    if (alertsError) {
      console.log('❌ Alerts table error:', alertsError.message);
    } else {
      console.log('✅ Alerts table exists');
    }
    
    // Check if outbound_messages table exists
    console.log('\n🔍 Checking outbound_messages table:');
    const { data: messagesData, error: messagesError } = await supabase
      .from('outbound_messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.log('❌ Outbound_messages table error:', messagesError.message);
    } else {
      console.log('✅ Outbound_messages table exists');
    }
    
  } catch (error) {
    console.error('❌ Error listing tables:', error);
  }
}

// Run the check
listTables();




