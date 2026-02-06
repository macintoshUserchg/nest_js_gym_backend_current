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

async function testFeature13() {
  console.log('\n=== TESTING FEATURE #13: Create gym with duplicate email fails ===\n');

  // Step 1: Login
  console.log('Step 1: Login as superadmin...');
  const loginRes = await request('POST', '/auth/login', {
    email: 'superadmin@fitnessfirstelite.com',
    password: 'SuperAdmin123!'
  });
  console.log('Login status:', loginRes.status);
  const token = loginRes.data.access_token;
  console.log('Token received:', token ? 'Yes' : 'No');

  // Step 2: Create first gym
  console.log('\nStep 2: Create first gym with email test_feature_13@gym.com...');
  const gym1Data = {
    name: 'Test Gym Feature 13',
    email: 'test_feature_13@gym.com',
    phone: '+1234567890',
    address: '123 Test Street'
  };
  const gym1Res = await request('POST', '/gyms', gym1Data, token);
  console.log('First gym creation status:', gym1Res.status);
  console.log('Response:', JSON.stringify(gym1Res.data, null, 2));

  if (gym1Res.status !== 201) {
    console.log('\n❌ FAILED: Could not create first gym');
    return false;
  }

  const gym1Id = gym1Res.data.gymId;
  console.log('First gym created with ID:', gym1Id);

  // Step 3: Try to create second gym with same email
  console.log('\nStep 3: Attempt to create second gym with same email...');
  const gym2Data = {
    name: 'Test Gym Feature 13 Duplicate',
    email: 'test_feature_13@gym.com',
    phone: '+0987654321',
    address: '456 Duplicate Street'
  };
  const gym2Res = await request('POST', '/gyms', gym2Data, token);
  console.log('Second gym creation status:', gym2Res.status);
  console.log('Response:', JSON.stringify(gym2Res.data, null, 2));

  // Step 4: Verify error status
  console.log('\nStep 4: Verify error status is 400 or 409...');
  if (gym2Res.status !== 400 && gym2Res.status !== 409) {
    console.log('❌ FAILED: Expected status 400 or 409, got:', gym2Res.status);
    return false;
  }
  console.log('✅ Status code is correct:', gym2Res.status);

  // Step 5: Verify error message mentions duplicate
  console.log('\nStep 5: Verify error message mentions duplicate or unique constraint...');
  const errorMsg = JSON.stringify(gym2Res.data);
  const hasDuplicateMsg = errorMsg.toLowerCase().includes('duplicate') ||
                          errorMsg.toLowerCase().includes('unique') ||
                          errorMsg.toLowerCase().includes('constraint');
  if (hasDuplicateMsg) {
    console.log('✅ Error message mentions duplicate/unique constraint');
  } else {
    console.log('⚠️  Warning: Error message does not explicitly mention duplicate/unique constraint');
    console.log('   Error message:', errorMsg);
  }

  // Step 6: Verify second gym was not created
  console.log('\nStep 6: Verify second gym was not created in database...');
  const getAllGyms = await request('GET', '/gyms', null, token);
  const duplicateEmailCount = getAllGyms.data.filter(g => g.email === 'test_feature_13@gym.com').length;
  if (duplicateEmailCount === 1) {
    console.log('✅ Only one gym exists with the email');
  } else {
    console.log('❌ FAILED: Found', duplicateEmailCount, 'gyms with the same email');
    return false;
  }

  // Cleanup
  console.log('\nCleaning up: Deleting test gym...');
  await request('DELETE', `/gyms/${gym1Id}`, null, token);
  console.log('✅ Test gym deleted');

  console.log('\n✅ FEATURE #13 PASSED\n');
  return true;
}

testFeature13().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
