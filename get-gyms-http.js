const http = require('http');

const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZmFjOGJjYi0yOWExLTQ5MTEtOWVhNi0yMzExY2VmNGVhMWQiLCJlbWFpbCI6InN1cGVyYWRtaW5AZml0bmVzc2ZpcnN0ZWxpdGUuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NzAzNDM5OTgsImV4cCI6MTc3MDQzMDM5OH0.UjsyYwnJsdplNucsTKZ535g6xpzJhsPkIGo-x-ef9U0`;

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/gyms',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.length > 0) {
      console.log(result[0].gymId);
    } else {
      console.log('NO_GYMS_FOUND');
    }
  });
});

req.on('error', (e) => { console.error('ERROR:', e.message); });
req.end();
