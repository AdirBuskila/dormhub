// Temporary test file to debug Clerk token
// Run this in browser console on your app

async function testClerkToken() {
  const { useAuth } = await import('@clerk/nextjs');
  const { getToken } = useAuth();
  
  const token = await getToken({ template: 'supabase' });
  
  console.log('Token:', token);
  
  if (token) {
    // Decode JWT (just the payload, no verification)
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('JWT Payload:', payload);
      console.log('Has sub claim?', 'sub' in payload);
      console.log('sub value:', payload.sub);
    }
  }
}

testClerkToken();


