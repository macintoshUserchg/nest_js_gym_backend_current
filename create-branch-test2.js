const http = require('http');

const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZmFjOGJjYi0yOWExLTQ5MTEtOWVhNi0yMzExY2VmNGVhMWQiLCJlbWFpbCI6InN1cGVyYWRtaW5AZml0bmVzc2ZpcnN0ZWxpdGUuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NzAzNDM5OTgsImV4cCI6MTc3MDQzMDM5OH0.UjsyYwnJsdplNucsTKZ535g6xpzJhsPkIGo-x-ef9U0`;

const branchData = {
  name: `FEATURE_16_TEST_BRANCH_${Date.now()}`,
  email: 'branch16@test.com',
  phone: '555-0166',
  address: '742 Evergreen Terrace, Springfield',
  location: 'Springfield',
  state: 'IL',
  mainBranch: false,
  latitude: 39.7817,
  longitude: -89.6501
};

const gymId = '50c10bb3-78e2-41f2-bde6-7d0280d5dfcb';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/gyms/${gymId}/branches`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', data);

    // Save branchId if created successfully
    if (res.statusCode === 201) {
      const result = JSON.parse(data);
      if (result.branchId) {
        require('fs').writeFileSync('/tmp/created_branch_id.txt', result.branchId);
        console.log('Branch ID saved:', result.branchId);
      }
    }
  });
});

req.on('error', (e) => { console.error('ERROR:', e.message); });
req.write(JSON.stringify(branchData));
req.end();
