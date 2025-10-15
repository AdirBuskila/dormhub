// Test script to verify the onboarding flow works correctly
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOnboardingFlow() {
  console.log('🧪 Testing Client Onboarding Flow...');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check if shosh1@gmail.com has a client record
    console.log('\n1. Checking if shosh1@gmail.com has a client record...');
    
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .or('name.ilike.%shosh1%')
      .or('phone.ilike.%shosh1%');
    
    if (clientError) {
      console.log('❌ Error fetching clients:', clientError.message);
    } else {
      console.log('✅ Clients found:', clients.length);
      if (clients.length > 0) {
        console.log('   Client data:', clients[0]);
      }
    }

    // Test 2: Check if the client has the required fields
    console.log('\n2. Checking client profile completeness...');
    
    if (clients && clients.length > 0) {
      const client = clients[0];
      const hasPhone = !!client.phone;
      const hasCity = !!client.city;
      const hasShopName = !!client.shop_name;
      
      console.log(`   Phone: ${hasPhone ? '✅' : '❌'} (${client.phone || 'missing'})`);
      console.log(`   City: ${hasCity ? '✅' : '❌'} (${client.city || 'missing'})`);
      console.log(`   Shop Name: ${hasShopName ? '✅' : '❌'} (${client.shop_name || 'missing'})`);
      
      const isComplete = hasPhone && hasCity && hasShopName;
      console.log(`   Profile Complete: ${isComplete ? '✅' : '❌'}`);
      
      if (!isComplete) {
        console.log('   → This client should see the onboarding modal');
      } else {
        console.log('   → This client should NOT see the onboarding modal');
      }
    } else {
      console.log('   → No client record found - should see onboarding modal');
    }

    // Test 3: Test the upsert-self API endpoint
    console.log('\n3. Testing upsert-self API endpoint...');
    
    const testData = {
      phone: '050-1234567',
      city: 'תל אביב',
      shop_name: 'חנות המובייל של שוש'
    };
    
    console.log('   Test data:', testData);
    console.log('   → This would be sent to /api/clients/upsert-self');
    console.log('   → The API should create/update the client record');

    // Test 4: Check database schema
    console.log('\n4. Checking database schema...');
    
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'clients')
      .in('column_name', ['phone', 'city', 'shop_name']);
    
    if (schemaError) {
      console.log('❌ Error checking schema:', schemaError.message);
    } else {
      console.log('✅ Client table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n' + '=' .repeat(50));
    console.log('📋 Onboarding Flow Test Summary:');
    console.log('1. Check if client record exists');
    console.log('2. Verify profile completeness (phone, city, shop_name)');
    console.log('3. Test upsert-self API endpoint');
    console.log('4. Verify database schema has required fields');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Make sure shosh1@gmail.com is NOT in ADMIN_EMAILS');
    console.log('2. Clear browser cache and cookies');
    console.log('3. Sign in with shosh1@gmail.com');
    console.log('4. Check browser console for any errors');
    console.log('5. Verify the onboarding modal appears');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOnboardingFlow().catch(console.error);
