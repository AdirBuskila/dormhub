/**
 * Diagnostic script to check WhatsApp configuration
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== WhatsApp Setup Diagnostic ===\n');

// 1. Check environment variables
console.log('1. Environment Variables:');
console.log('   WHATSAPP_TEST_MODE:', process.env.WHATSAPP_TEST_MODE || 'NOT SET (defaults to queue-only)');
console.log('   WHATSAPP_PROVIDER:', process.env.WHATSAPP_PROVIDER || 'NOT SET');
console.log('   ADMIN_PHONE:', process.env.ADMIN_PHONE ? '✓ SET' : '✗ NOT SET');
console.log('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✓ SET' : '✗ NOT SET');
console.log('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✓ SET' : '✗ NOT SET');
console.log('   TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM ? '✓ SET' : '✗ NOT SET');

console.log('\n2. Configuration Status:');

// Check test mode
if (process.env.WHATSAPP_TEST_MODE === 'true') {
  console.log('   ⚠️  TEST MODE IS ON - Messages will only be logged and queued, not sent!');
  console.log('       Set WHATSAPP_TEST_MODE=false in your .env.local to send real messages');
} else {
  console.log('   ✓ Test mode is OFF');
}

// Check Twilio configuration
if (process.env.WHATSAPP_PROVIDER === 'twilio') {
  console.log('   ✓ Provider is set to Twilio');
  
  const hasSid = !!process.env.TWILIO_ACCOUNT_SID;
  const hasToken = !!process.env.TWILIO_AUTH_TOKEN;
  const hasFrom = !!process.env.TWILIO_WHATSAPP_FROM;
  
  if (hasSid && hasToken && hasFrom) {
    console.log('   ✓ All Twilio credentials are configured');
  } else {
    console.log('   ✗ Missing Twilio credentials:');
    if (!hasSid) console.log('     - TWILIO_ACCOUNT_SID');
    if (!hasToken) console.log('     - TWILIO_AUTH_TOKEN');
    if (!hasFrom) console.log('     - TWILIO_WHATSAPP_FROM');
  }
} else {
  console.log('   ⚠️  WHATSAPP_PROVIDER not set to "twilio" - messages will only be queued');
  console.log('       Set WHATSAPP_PROVIDER=twilio in your .env.local');
}

console.log('\n3. Recommendations:');
console.log('');

if (process.env.WHATSAPP_TEST_MODE === 'true') {
  console.log('   📋 To send real WhatsApp messages:');
  console.log('      Add to .env.local: WHATSAPP_TEST_MODE=false');
}

if (process.env.WHATSAPP_PROVIDER !== 'twilio') {
  console.log('   📋 To use Twilio for WhatsApp:');
  console.log('      Add to .env.local: WHATSAPP_PROVIDER=twilio');
}

const hasSid = !!process.env.TWILIO_ACCOUNT_SID;
const hasToken = !!process.env.TWILIO_AUTH_TOKEN;
const hasFrom = !!process.env.TWILIO_WHATSAPP_FROM;

if (!hasSid || !hasToken || !hasFrom) {
  console.log('   📋 Add your Twilio credentials to .env.local:');
  if (!hasSid) console.log('      TWILIO_ACCOUNT_SID=your_account_sid');
  if (!hasToken) console.log('      TWILIO_AUTH_TOKEN=your_auth_token');
  if (!hasFrom) console.log('      TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  (Twilio Sandbox number)');
}

console.log('\n   📋 For customer notifications to work:');
console.log('      - Ensure your client records have phone numbers in E.164 format (+972...)');
console.log('      - Check the "clients" table in Supabase for the phone field');

console.log('\n4. Next Steps:');
console.log('   1. Check your client record in Supabase - does it have a phone number?');
console.log('   2. Configure environment variables as needed (see above)');
console.log('   3. For Twilio Sandbox: Both sender and receiver must join sandbox first');
console.log('   4. Send a test message: POST to /api/test-whatsapp-simple');
console.log('\n');

