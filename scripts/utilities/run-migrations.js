const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration(migrationFile) {
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error(`Error running migration ${migrationFile}:`, error);
      return false;
    }
    
    console.log(`✅ Migration ${migrationFile} completed successfully`);
    return true;
  } catch (error) {
    console.error(`Error running migration ${migrationFile}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting B2B migrations...');
  
  const migrations = [
    '007_add_product_enhancements.sql',
    '008_add_consignments_table.sql'
  ];
  
  let successCount = 0;
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${migrations.length - successCount}`);
  
  if (successCount === migrations.length) {
    console.log('\n🎉 All B2B migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
