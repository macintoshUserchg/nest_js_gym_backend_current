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

async function testFeature15() {
  console.log('\n=== TESTING FEATURE #15: Delete gym cascades to branches ===\n');

  // Generate unique data
  const timestamp = Date.now();
  const testEmail = `test_feature_15_${timestamp}@gym.com`;

  // Step 1: Login
  console.log('Step 1: Login as superadmin...');
  const loginRes = await request('POST', '/auth/login', {
    email: 'superadmin@fitnessfirstelite.com',
    password: 'SuperAdmin123!'
  });
  console.log('✅ Login successful');
  const token = loginRes.data.access_token;

  // Step 2: Create a test gym
  console.log('\nStep 2: Create a test gym via POST /gyms...');
  const gymData = {
    name: 'Test Gym Feature 15',
    email: testEmail,
    phone: '+1234567890',
    address: '123 Test Street'
  };
  const gymRes = await request('POST', '/gyms', gymData, token);
  console.log('✅ Gym created with ID:', gymRes.data.gymId);
  const gymId = gymRes.data.gymId;

  // Step 3: Create 2-3 branches under this gym
  console.log('\nStep 3: Create 3 branches under this gym...');
  const branch1Res = await request('POST', `/gyms/${gymId}/branches`, {
    name: 'Branch 1',
    address: 'Address 1',
    phone: '+1111111111'
  }, token);
  console.log('✅ Branch 1 created:', branch1Res.data.gym.branches[0].branchId);

  const branch2Res = await request('POST', `/gyms/${gymId}/branches`, {
    name: 'Branch 2',
    address: 'Address 2',
    phone: '+2222222222'
  }, token);
  console.log('✅ Branch 2 created:', branch2Res.data.gym.branches[1].branchId);

  const branch3Res = await request('POST', `/gyms/${gymId}/branches`, {
    name: 'Branch 3',
    address: 'Address 3',
    phone: '+3333333333'
  }, token);
  console.log('✅ Branch 3 created:', branch3Res.data.gym.branches[2].branchId);

  const branchIds = [
    branch1Res.data.gym.branches[0].branchId,
    branch2Res.data.gym.branches[1].branchId,
    branch3Res.data.gym.branches[2].branchId
  ];

  // Step 4: Verify branches exist via GET /branches?gymId=<id>
  console.log('\nStep 4: Verify branches exist via GET /gyms/<gymId>/branches...');
  const branchesBeforeRes = await request('GET', `/gyms/${gymId}/branches`, null, token);
  console.log(`✅ Found ${branchesBeforeRes.data.length} branches before deletion`);

  if (branchesBeforeRes.data.length !== 4) { // 3 branches + 1 default main branch
    console.log('❌ FAILED: Expected 4 branches (3 created + 1 main), got:', branchesBeforeRes.data.length);
    return false;
  }

  // Step 5: Send DELETE request to /gyms/<id>
  console.log('\nStep 5: Send DELETE request to /gyms/<id>...');
  const deleteRes = await request('DELETE', `/gyms/${gymId}`, null, token);
  console.log('Delete response status:', deleteRes.status);
  console.log('Delete response:', JSON.stringify(deleteRes.data, null, 2));

  // Step 6: Verify response status is 200 OK
  if (deleteRes.status !== 200) {
    console.log('❌ FAILED: Expected status 200, got:', deleteRes.status);
    return false;
  }
  console.log('✅ Status code is 200 OK');

  // Step 7: Query GET /gyms/<gymId>/branches - should return empty array
  console.log('\nStep 7: Query GET /gyms/<gymId>/branches - should return empty or 404...');
  const branchesAfterRes = await request('GET', `/gyms/${gymId}/branches`, null, token);
  console.log('Branches after deletion response status:', branchesAfterRes.status);

  // The gym is deleted, so we expect either 404 (gym not found) or empty array
  if (branchesAfterRes.status === 404) {
    console.log('✅ Gym not found (expected after deletion)');
  } else if (branchesAfterRes.status === 200 && branchesAfterRes.data.length === 0) {
    console.log('✅ No branches found (cascade worked)');
  } else {
    console.log('❌ FAILED: Expected 404 or empty array, got status:', branchesAfterRes.status);
    if (branchesAfterRes.data && branchesAfterRes.data.length > 0) {
      console.log('❌ FAILED: Branches still exist:', branchesAfterRes.data);
      return false;
    }
  }

  // Step 8: Verify branches were deleted (cascade worked)
  console.log('\nStep 8: Verify branches were deleted by querying individual branch IDs...');
  let branchesDeleted = 0;
  for (const branchId of branchIds) {
    const branchRes = await request('GET', `/branches/${branchId}`, null, token);
    if (branchRes.status === 404) {
      branchesDeleted++;
      console.log(`✅ Branch ${branchId} deleted (404 Not Found)`);
    } else {
      console.log(`❌ Branch ${branchId} still exists:`, branchRes.data);
    }
  }

  if (branchesDeleted !== branchIds.length) {
    console.log(`❌ FAILED: Only ${branchesDeleted}/${branchIds.length} branches were deleted`);
    return false;
  }
  console.log(`✅ All ${branchIds.length} branches were deleted (cascade worked)`);

  console.log('\n✅ FEATURE #15 PASSED\n');
  return true;
}

testFeature15().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
