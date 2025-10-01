require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkClients() {
  try {
    console.log('🔄 Checking clients table...');
    
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email, clerk_user_id, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching clients:', error.message);
      return;
    }
    
    if (!clients || clients.length === 0) {
      console.log('📭 No clients found in database');
      return;
    }
    
    console.log(`📋 Found ${clients.length} clients:`);
    console.log('─'.repeat(80));
    
    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Clerk User ID: ${client.clerk_user_id || 'NULL'}`);
      console.log(`   Client ID: ${client.id}`);
      console.log(`   Created: ${client.created_at}`);
      console.log('');
    });
    
    console.log('─'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkClients();
