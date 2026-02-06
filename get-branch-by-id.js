const http = require('http');

const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZmFjOGJjYi0yOWExLTQ5MTEtOWVhNi0yMzExY2VmNGVhMWQiLCJlbWFpbCI6InN1cGVyYWRtaW5AZml0bmVzc2ZpcnN0ZWxpdGUuY29tIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NzAzNDM5OTgsImV4cCI6MTc3MDQzMDM5OH0.UjsyYwnJsdplNucsTKZ535g6xpzJhsPkIGo-x-ef9U0`;

const branchId = '54bbabe3-dd69-41be-aec2-3a4a40a50d7b';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/branches/${branchId}`,
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
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', data);
  });
});

req.on('error', (e) => { console.error('ERROR:', e.message); });
req.end();
