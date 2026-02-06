#!/usr/bin/env node

const http = require('http');

function request(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3000');
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

    console.log(`Request: ${method} ${options.path}`);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          console.log(`Response: ${res.statusCode}`, parsed);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          console.log(`Response: ${res.statusCode}`, body);
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      console.log('Error:', err);
      reject(err);
    });
    if (data) {
      console.log('Body:', JSON.stringify(data));
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test() {
  try {
    const loginRes = await request('POST', '/auth/login', {
      email: 'superadmin@fitnessfirstelite.com',
      password: 'SuperAdmin123!'
    });
    console.log('Success!');
  } catch (e) {
    console.error('Failed:', e);
  }
}

test();
