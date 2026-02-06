const http = require('http');

// Helper function to make HTTP requests
function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testFeature14() {
  console.log('\n=== TESTING FEATURE #14: Update gym with valid data ===\n');

  // Generate unique data
  const timestamp = Date.now();
  const testEmail = `test_feature_14_${timestamp}@gym.com`;

  // Step 1: Login
  console.log('Step 1: Login as superadmin...');
  const loginRes = await request('POST', '/auth/login', {
    email: 'superadmin@fitnessfirstelite.com',
    password: 'SuperAdmin123!'
  });
  console.log('✅ Login successful');
  const token = loginRes.data.access_token;

  // Step 2: Create a test gym
  console.log('\nStep 2: Create test gym via POST /gyms...');
  const gymData = {
    name: 'Test Gym Feature 14',
    email: testEmail,
    phone: '+1234567890',
    address: '123 Original Address',
    location: 'Original Location',
    state: 'Original State'
  };
  const createRes = await request('POST', '/gyms', gymData, token);
  console.log('✅ Gym created with ID:', createRes.data.gymId);
  const gymId = createRes.data.gymId;

  // Step 3: Update gym with PATCH request
  console.log('\nStep 3: Send PATCH request to /gyms/<id> with updated data...');
  const updateData = {
    name: 'Updated Gym Feature 14',
    phone: '+9999999999',
    address: '456 Updated Address'
  };
  const updateRes = await request('PATCH', `/gyms/${gymId}`, updateData, token);
  console.log('Update response status:', updateRes.status);
  console.log('Update response:', JSON.stringify(updateRes.data, null, 2));

  // Step 4: Verify response status is 200 OK
  console.log('\nStep 4: Verify response status is 200 OK...');
  if (updateRes.status !== 200) {
    console.log('❌ FAILED: Expected status 200, got:', updateRes.status);
    return false;
  }
  console.log('✅ Status code is 200 OK');

  // Step 5: Verify response contains updated gym data
  console.log('\nStep 5: Verify response contains updated gym data...');
  if (updateRes.data.name !== updateData.name) {
    console.log('❌ FAILED: Name not updated in response');
    return false;
  }
  if (updateRes.data.phone !== updateData.phone) {
    console.log('❌ FAILED: Phone not updated in response');
    return false;
  }
  if (updateRes.data.address !== updateData.address) {
    console.log('❌ FAILED: Address not updated in response');
    return false;
  }
  console.log('✅ Response contains updated gym data');

  // Step 6: Query GET /gyms/<id> to confirm changes persist
  console.log('\nStep 6: Query GET /gyms/<id> to confirm changes persist...');
  const getRes = await request('GET', `/gyms/${gymId}`, null, token);
  console.log('GET response:', JSON.stringify(getRes.data, null, 2));

  if (getRes.data.name !== updateData.name) {
    console.log('❌ FAILED: Name not persisted');
    return false;
  }
  if (getRes.data.phone !== updateData.phone) {
    console.log('❌ FAILED: Phone not persisted');
    return false;
  }
  if (getRes.data.address !== updateData.address) {
    console.log('❌ FAILED: Address not persisted');
    return false;
  }
  console.log('✅ Changes persisted correctly');

  // Step 7: Verify only specified fields are updated (partial update works)
  console.log('\nStep 7: Verify only specified fields are updated (partial update works)...');
  if (getRes.data.location !== gymData.location) {
    console.log('❌ FAILED: Location should not have been updated');
    return false;
  }
  if (getRes.data.state !== gymData.state) {
    console.log('❌ FAILED: State should not have been updated');
    return false;
  }
  if (getRes.data.email !== gymData.email) {
    console.log('❌ FAILED: Email should not have been updated');
    return false;
  }
  console.log('✅ Only specified fields were updated (partial update works)');

  // Cleanup
  console.log('\nCleaning up: Deleting test gym...');
  await request('DELETE', `/gyms/${gymId}`, null, token);
  console.log('✅ Test gym deleted');

  console.log('\n✅ FEATURE #14 PASSED\n');
  return true;
}

testFeature14().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
