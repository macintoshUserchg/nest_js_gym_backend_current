const http = require('http');

// Helper to make HTTP requests
function request(method, path, data = null, token = null) {
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
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  console.log('=== STEP 1: Login ===');
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@fitnessfirstelite.com',
    password: 'Admin123!'
  });

  console.log('Login status:', loginRes.status);
  if (loginRes.status !== 200) {
    console.log('Error:', loginRes.body);
    return;
  }

  const loginData = JSON.parse(loginRes.body);
  const token = loginData.access_token;
  console.log('Got token:', token.substring(0, 20) + '...');

  // Step 2: Create test gym
  console.log('\n=== STEP 2: Create test gym ===');
  const timestamp = Date.now();
  const gymName = `PERSIST_TEST_GYM_${timestamp}`;

  const createRes = await request('POST', '/gyms', {
    name: gymName,
    email: `test${timestamp}@example.com`,
    phone: '1234567890'
  }, token);

  console.log('Create status:', createRes.status);
  console.log('Response:', createRes.body);

  let gymId = null;
  if (createRes.status === 201 || createRes.status === 200) {
    const gymData = JSON.parse(createRes.body);
    gymId = gymData.gymId;
    console.log('Created gym ID:', gymId);
  }

  // Wait a moment
  await new Promise(r => setTimeout(r, 2000));

  // Step 3: Verify BEFORE restart
  console.log('\n=== STEP 3: Verify BEFORE restart ===');
  const getBefore = await request('GET', '/gyms', null, token);
  if (getBefore.body.includes(gymName)) {
    console.log('✓ Gym FOUND before restart');
  } else {
    console.log('✗ Gym NOT FOUND before restart');
  }

  // Save state to file for next phase
  const fs = require('fs');
  fs.writeFileSync('/tmp/persistence_test_state.json', JSON.stringify({
    token,
    gymName,
    gymId,
    timestamp
  }));

  console.log('\n=== State saved. Ready for restart test ===');
  console.log('Run: node test-persistence-restart.js');
}

main().catch(console.error);
