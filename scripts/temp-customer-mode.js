const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestCustomer() {
  try {
    console.log('🔄 Creating a test customer for order testing...');
    
    // Create a test client entry
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: 'Test Customer',
        phone: '+1234567890',
        address: '123 Test Street, Test City',
        payment_terms: 'on_delivery',
        total_spent: 0,
        total_debt: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test client:', error.message);
      return;
    }
    
    console.log('✅ Test customer created successfully!');
    console.log(`📋 Customer ID: ${client.id}`);
    console.log(`📋 Customer Name: ${client.name}`);
    console.log('\n🎯 To test as this customer:');
    console.log('1. Sign out of your admin account');
    console.log('2. Sign up with a new email (not in your admin list)');
    console.log('3. The system will create a client record automatically');
    console.log('4. You can then test the order creation flow');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createTestCustomer();
