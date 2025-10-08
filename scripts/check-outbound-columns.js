/**
 * Check what columns actually exist in outbound_messages table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOutboundColumns() {
  try {
    console.log('🔍 Checking outbound_messages table columns...');
    
    // Try different column names that might exist
    const possibleColumns = [
      'id', 'channel', 'to_client_id', 'to_phone', 'phone', 'recipient_phone',
      'template', 'payload', 'sent', 'sent_at', 'error', 'created_at'
    ];
    
    for (const column of possibleColumns) {
      try {
        const { data, error } = await supabase
          .from('outbound_messages')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ Column '${column}': ${error.message}`);
        } else {
          console.log(`✅ Column '${column}': exists`);
        }
      } catch (e) {
        console.log(`❌ Column '${column}': ${e.message}`);
      }
    }
    
    // Try to get all columns by selecting *
    console.log('\n🔍 Trying SELECT * to see all columns:');
    const { data: allData, error: allError } = await supabase
      .from('outbound_messages')
      .select('*')
      .limit(1);
    
    if (allError) {
      console.log('❌ SELECT * error:', allError);
    } else {
      console.log('✅ SELECT * works, columns:', allData.length > 0 ? Object.keys(allData[0]) : 'No data');
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:', error);
  }
}

// Run the check
checkOutboundColumns();




