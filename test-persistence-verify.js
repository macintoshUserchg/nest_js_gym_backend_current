const http = require('http');
const fs = require('fs');

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
  const state = JSON.parse(fs.readFileSync('/tmp/persistence_test_state.json'));
  const { token, gymName, gymId } = state;

  console.log('=== STEP 6: Verify AFTER restart ===');
  console.log('Looking for gym:', gymName);
  console.log('Gym ID:', gymId);

  const getAfter = await request('GET', '/gyms', null, token);
  console.log('Response status:', getAfter.status);

  if (getAfter.body.includes(gymName)) {
    console.log('✓✓✓ DATA PERSISTS: Gym found after restart!');
  } else {
    console.log('✗✗✗ CRITICAL FAILURE: Data LOST after restart');
    console.log('Response:', getAfter.body.substring(0, 500));
  }

  // Cleanup
  if (gymId) {
    console.log('\n=== Cleanup: Deleting test gym ===');
    const deleteRes = await request('DELETE', `/gyms/${gymId}`, null, token);
    console.log('Delete status:', deleteRes.status);
  }

  console.log('\n=== TEST COMPLETE ===');
}

main().catch(console.error);
