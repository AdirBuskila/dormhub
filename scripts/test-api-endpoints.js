// Simple API endpoint test
console.log('🧪 Testing API Endpoints...');
console.log('=' .repeat(40));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (response.ok) {
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`❌ ${method} ${endpoint} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n1. Testing Search API...');
  await testEndpoint('/api/search?q=test');
  
  console.log('\n2. Testing Alerts API...');
  await testEndpoint('/api/alerts/count');
  
  console.log('\n3. Testing Consignments API...');
  await testEndpoint('/api/consignments');
  
  console.log('\n4. Testing Health Check...');
  await testEndpoint('/api/health');
  
  console.log('\n5. Testing Products API...');
  await testEndpoint('/api/products');
  
  console.log('\n6. Testing Orders API...');
  await testEndpoint('/api/orders');
  
  console.log('\n' + '=' .repeat(40));
  console.log('📋 API Test Summary:');
  console.log('✅ Check the results above for each endpoint');
  console.log('❌ If any endpoint fails, check:');
  console.log('   - Is the development server running? (npm run dev)');
  console.log('   - Are environment variables set correctly?');
  console.log('   - Are the API routes properly implemented?');
  
  console.log('\n🔧 To start the development server:');
  console.log('   npm run dev');
  
  console.log('\n🎉 API endpoint testing complete!');
}

runTests().catch(console.error);
