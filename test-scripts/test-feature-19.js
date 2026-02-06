#!/usr/bin/env node

/**
 * Test Feature #19: Create member with duplicate email fails
 *
 * Steps:
 * 1. Create first member with email 'member@test.com'
 * 2. Verify first member created successfully
 * 3. Send POST request to create second member with same email
 * 4. Verify response status is 400 or 409 Conflict
 * 5. Verify error message mentions duplicate email
 * 6. Verify second member was not created
 * 7. Query database to confirm only one member with this email exists
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
const timestamp = Date.now();
const TEST_EMAIL = `test_feature_19_${timestamp}@test.com`;

let authToken = null;
let firstMemberId = null;
let branchId = null;
let planId = null;

// Helper function to make HTTP requests
function request(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('='.repeat(60));
  console.log('Feature #19: Create member with duplicate email fails');
  console.log('='.repeat(60));

  try {
    // Step 0: Login to get auth token
    console.log('\n📝 Step 0: Login as superadmin...');
    const loginRes = await request('POST', '/auth/login', {
      email: 'superadmin@fitnessfirstelite.com',
      password: 'SuperAdmin123!'
    });

    if (loginRes.status !== 200 && loginRes.status !== 201) {
      throw new Error(`Login failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
    }

    authToken = loginRes.data.access_token;
    console.log('✅ Login successful');

    // Step 0.5: Get a valid branch and membership plan
    console.log('\n📝 Step 0.5: Getting branch and membership plan...');

    const gymsRes = await request('GET', '/gyms', null, {
      Authorization: `Bearer ${authToken}`,
    });

    if (gymsRes.status !== 200 || !gymsRes.data?.length) {
      throw new Error('No gyms found');
    }

    const gym = gymsRes.data[0];
    branchId = gym.branches?.[0]?.branchId;

    if (!branchId) {
      throw new Error('No branches found');
    }

    const plansRes = await request('GET', '/membership-plans', null, {
      Authorization: `Bearer ${authToken}`,
    });

    if (plansRes.status !== 200 || !plansRes.data?.length) {
      throw new Error('No membership plans found');
    }

    planId = plansRes.data[0].id;

    console.log(`✅ Using branch: ${branchId}, plan: ${planId}`);

    // Step 1: Create first member
    console.log(`\n📝 Step 1: Creating first member with email ${TEST_EMAIL}...`);

    const firstMemberData = {
      fullName: 'Test Member Feature 19',
      email: TEST_EMAIL,
      phone: '+1-555-0001',
      gender: 'other',
      branchId: branchId,
      membershipPlanId: planId,
    };

    const firstMemberRes = await request('POST', '/members', firstMemberData, {
      Authorization: `Bearer ${authToken}`,
    });

    if (firstMemberRes.status !== 201) {
      throw new Error(`Failed to create first member: ${firstMemberRes.status} - ${JSON.stringify(firstMemberRes.data)}`);
    }

    firstMemberId = firstMemberRes.data.id;
    console.log(`✅ First member created with ID: ${firstMemberId}`);

    // Step 2: Verify first member was created
    console.log('\n📝 Step 2: Verifying first member exists...');

    const verifyRes = await request('GET', `/members/${firstMemberId}`, null, {
      Authorization: `Bearer ${authToken}`,
    });

    if (verifyRes.status !== 200) {
      throw new Error('First member not found');
    }

    console.log('✅ First member verified in database');

    // Step 3: Try to create second member with same email
    console.log('\n📝 Step 3: Creating second member with duplicate email...');

    const secondMemberData = {
      fullName: 'Duplicate Member Feature 19',
      email: TEST_EMAIL, // Same email as first member
      phone: '+1-555-0002',
      gender: 'other',
      branchId: branchId,
      membershipPlanId: planId,
    };

    const secondMemberRes = await request('POST', '/members', secondMemberData, {
      Authorization: `Bearer ${authToken}`,
    });

    console.log(`   Response status: ${secondMemberRes.status}`);
    console.log(`   Response data: ${JSON.stringify(secondMemberRes.data)}`);

    // Step 4: Verify response status is 409 Conflict (or 400)
    console.log('\n📝 Step 4: Verifying conflict response...');

    if (secondMemberRes.status !== 409 && secondMemberRes.status !== 400) {
      throw new Error(`Expected 409 or 400, got ${secondMemberRes.status}`);
    }

    console.log('✅ Response status is correct (409 Conflict or 400 Bad Request)');

    // Step 5: Verify error message mentions duplicate
    console.log('\n📝 Step 5: Verifying error message...');

    const errorMsg = JSON.stringify(secondMemberRes.data).toLowerCase();
    if (!errorMsg.includes('duplicate') && !errorMsg.includes('already exists')) {
      throw new Error(`Error message doesn't mention duplicate: ${secondMemberRes.data}`);
    }

    console.log('✅ Error message mentions duplicate email');

    // Step 6: Verify second member was not created
    console.log('\n📝 Step 6: Verifying second member was not created...');

    const searchRes = await request('GET', `/members?search=${TEST_EMAIL}`, null, {
      Authorization: `Bearer ${authToken}`,
    });

    if (searchRes.status !== 200) {
      throw new Error('Failed to search for members');
    }

    const membersWithEmail = searchRes.data.filter(m => m.email === TEST_EMAIL);

    if (membersWithEmail.length !== 1) {
      throw new Error(`Expected 1 member with email ${TEST_EMAIL}, found ${membersWithEmail.length}`);
    }

    console.log('✅ Only one member with this email exists (second member not created)');

    // Step 7: Cleanup
    console.log('\n📝 Step 7: Cleaning up test data...');

    await request('DELETE', `/members/${firstMemberId}`, null, {
      Authorization: `Bearer ${authToken}`,
    });

    console.log('✅ Test data cleaned up');

    // All steps passed
    console.log('\n' + '='.repeat(60));
    console.log('✅ FEATURE #19 PASSED: All steps completed successfully');
    console.log('='.repeat(60));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\n' + '='.repeat(60));
    console.error('❌ FEATURE #19 FAILED');
    console.error('='.repeat(60));

    // Cleanup on failure
    if (firstMemberId && authToken) {
      console.log('\n🧹 Cleaning up test data...');
      try {
        await request('DELETE', `/members/${firstMemberId}`, null, {
          Authorization: `Bearer ${authToken}`,
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

runTest();
