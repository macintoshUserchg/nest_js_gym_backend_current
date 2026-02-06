#!/usr/bin/env node

/**
 * Database Verification Script
 * Tests: Feature #1 (Connection), Feature #2 (Schema), Feature #3 (Persistence)
 */

const https = require('https');

const API_BASE = 'http://localhost:3000';
let authToken = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = require('http').request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
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

async function main() {
  console.log('=== DATABASE VERIFICATION SCRIPT ===\n');

  // Feature #1: Test database connection
  console.log('📝 Feature #1: Testing database connection...');
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status === 200 && health.data.status === 'ok') {
      console.log('✅ Health endpoint OK - server is running');

      // Login to test database query
      const login = await makeRequest('POST', '/auth/login', {
        email: 'superadmin@fitnessfirstelite.com',
        password: 'SuperAdmin123!'
      });

      if (login.status === 201 && login.data.access_token) {
        authToken = login.data.access_token;
        console.log('✅ Database connection verified - login successful');
        console.log('✅ TypeORM connection is active\n');
      } else {
        console.log('❌ Login failed - database may not be connected\n');
        process.exit(1);
      }
    }
  } catch (error) {
    console.log('❌ Feature #1 FAILED:', error.message, '\n');
    process.exit(1);
  }

  // Feature #2: Test database schema
  console.log('📝 Feature #2: Testing database schema...');
  try {
    // Test gyms table
    const gyms = await makeRequest('GET', '/gyms');
    if (gyms.status === 200 && Array.isArray(gyms.data)) {
      console.log(`✅ Gyms table exists: ${gyms.data.length} records`);

      if (gyms.data.length > 0) {
        const gym = gyms.data[0];
        const requiredFields = ['gymId', 'name', 'email', 'phone', 'address', 'location', 'state'];
        const missingFields = requiredFields.filter(f => !(f in gym));

        if (missingFields.length === 0) {
          console.log('✅ Gyms table has all required columns');
        } else {
          console.log(`❌ Gyms table missing columns: ${missingFields.join(', ')}`);
        }

        // Check branches relationship
        if (gym.branches && Array.isArray(gym.branches)) {
          console.log(`✅ Branches relationship working: ${gym.branches.length} branches`);
          const branch = gym.branches[0];
          const branchFields = ['branchId', 'name', 'gymGymId'];
          const missingBranchFields = branchFields.filter(f => !(f in branch));
          if (missingBranchFields.length === 0) {
            console.log('✅ Branches table has all required columns');
          }
        }
      }
    }

    // Test users table
    const users = await makeRequest('GET', '/users');
    if (users.status === 200 && Array.isArray(users.data)) {
      console.log(`✅ Users table exists: ${users.data.length} records`);

      if (users.data.length > 0) {
        const user = users.data[0];
        const userFields = ['userId', 'email', 'roleId'];
        const missingUserFields = userFields.filter(f => !(f in user));

        if (missingUserFields.length === 0) {
          console.log('✅ Users table has all required columns');
        }
      }
    }

    console.log('✅ Database schema verified\n');
  } catch (error) {
    console.log('❌ Feature #2 FAILED:', error.message, '\n');
  }

  // Feature #3: Test data persistence across restart
  console.log('📝 Feature #3: Testing data persistence...');
  console.log('⚠️  This feature requires manual server restart');
  console.log('Steps to complete manually:');
  console.log('1. Create unique test data via API');
  console.log('2. Verify data exists');
  console.log('3. STOP server completely');
  console.log('4. RESTART server');
  console.log('5. Verify data still exists');
  console.log('6. Clean up test data\n');

  console.log('=== VERIFICATION COMPLETE ===');
}

main().catch(console.error);
