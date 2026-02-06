const http = require('http');

// Login to get token
function login(callback) {
  const data = JSON.stringify({
    email: 'superadmin@fitnessfirstelite.com',
    password: 'SuperAdmin123!'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      const response = JSON.parse(body);
      callback(response.access_token);
    });
  });

  req.on('error', (e) => {
    console.error('Login error:', e.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

// Test protected endpoint
function testEndpoint(token, path) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`\n=== Testing ${path} ===`);
      console.log(`Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        const data = JSON.parse(body);
        console.log(`Success! Array length: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } else {
        console.log(`Response: ${body.substring(0, 200)}`);
      }
    });
  });

  req.on('error', (e) => console.error(`Request error: ${e.message}`));
  req.end();
}

// Run tests
login((token) => {
  console.log('Token obtained, testing endpoints...');
  testEndpoint(token, '/gyms');
  testEndpoint(token, '/members');
});
