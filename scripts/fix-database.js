/**
 * Fix database schema for new order alerts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Step 1: Update alerts table constraint
    console.log('\n1️⃣ Updating alerts table constraint...');
    const { error: constraintError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_type_check;
        ALTER TABLE alerts ADD CONSTRAINT alerts_type_check 
        CHECK (type IN ('low_stock', 'undelivered', 'overdue_payment', 'reserved_stale', 'new_order'));
      `
    });
    
    if (constraintError) {
      console.log('❌ Constraint update error:', constraintError);
    } else {
      console.log('✅ Alerts constraint updated');
    }
    
    // Step 2: Add missing columns to outbound_messages
    console.log('\n2️⃣ Adding missing columns to outbound_messages...');
    const { error: columnsError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE outbound_messages 
        ADD COLUMN IF NOT EXISTS to_phone text,
        ADD COLUMN IF NOT EXISTS sent_at timestamptz,
        ADD COLUMN IF NOT EXISTS error text;
      `
    });
    
    if (columnsError) {
      console.log('❌ Columns update error:', columnsError);
    } else {
      console.log('✅ Outbound_messages columns added');
    }
    
    // Step 3: Test the fixes
    console.log('\n3️⃣ Testing fixes...');
    
    // Test alerts insert
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
      console.log('❌ Alert test failed:', alertError);
    } else {
      console.log('✅ Alert test passed');
    }
    
    // Test outbound_messages insert
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
      console.log('❌ Message test failed:', messageError);
    } else {
      console.log('✅ Message test passed');
    }
    
    console.log('\n🎉 Database fix completed!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
  }
}

// Run the fix
fixDatabase();




