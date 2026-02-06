const https = require('https');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api-json',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const api = JSON.parse(data);
    console.log('Total endpoints:', Object.keys(api.paths).length);
    console.log('\nTags defined:');
    api.tags.forEach(tag => {
      console.log(`  - ${tag.name}: ${tag.description}`);
    });
    console.log('\nSample endpoints:');
    Object.keys(api.paths).slice(0, 10).forEach(path => {
      console.log(`  ${path}`);
    });
    console.log(`\n... and ${Object.keys(api.paths).length - 10} more endpoints`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
