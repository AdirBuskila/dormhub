// Test script to test the upsert-self API endpoint
const testData = {
  phone: '0546093624',
  city: 'אשקלון',
  shop_name: 'Shosh for you'
};

async function testUpsert() {
  try {
    console.log('Testing upsert-self API...');
    console.log('Data:', testData);
    
    const response = await fetch('http://localhost:3001/api/clients/upsert-self', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUpsert();
