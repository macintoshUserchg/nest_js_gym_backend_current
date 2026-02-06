const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

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
  // Load saved state
  const state = JSON.parse(fs.readFileSync('/tmp/persistence_test_state.json'));
  const { token, gymName, gymId } = state;

  console.log('=== STEP 4: Stop server ===');
  try {
    execSync('pkill -f "nest start"', { stdio: 'ignore' });
    console.log('Kill command sent');
  } catch (e) {
    // Ignore if no process found
  }

  await new Promise(r => setTimeout(r, 3000));

  // Verify server stopped
  try {
    await request('GET', '/health');
    console.log('✗ Server still running');
    return;
  } catch (e) {
    console.log('✓ Server stopped successfully');
  }

  console.log('\n=== STEP 5: Restart server ===');
  const { spawn } = require('child_process');

  // Start server in background
  const server = spawn('npm', ['run', 'start:dev'], {
    cwd: process.cwd(),
    stdio: 'ignore',
    shell: true,
    detached: true
  });
  server.unref();

  console.log('Server PID:', server.pid);
  console.log('Waiting 15 seconds for startup...');

  await new Promise(r => setTimeout(r, 15000));

  // Check server health
  try {
    const health = await request('GET', '/health');
    if (health.status === 200) {
      console.log('✓ Server restarted successfully');
    }
  } catch (e) {
    console.log('✗ Server failed to restart:', e.message);
    return;
  }

  console.log('\n=== STEP 6: Verify AFTER restart ===');
  const getAfter = await request('GET', '/gyms', null, token);

  if (getAfter.body.includes(gymName)) {
    console.log('✓✓✓ DATA PERSISTS: Gym found after restart!');
  } else {
    console.log('✗✗✗ CRITICAL FAILURE: Data LOST after restart');
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
