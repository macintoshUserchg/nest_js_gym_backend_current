#!/usr/bin/env node

const fs = require('fs');

// Read cache
const cache = JSON.parse(fs.readFileSync('postman/auth-cache.json', 'utf8'));

// Build captured-responses format
const captured = {
  "User login": {
    userid: cache.userid,
    access_token: cache.token,
    email: cache.email,
    role: cache.role
  }
};

// Initialize or update captured-responses.json
let existingCaptured = {};
if (fs.existsSync('postman/captured-responses.json')) {
  existingCaptured = JSON.parse(fs.readFileSync('postman/captured-responses.json', 'utf8') || '{}');
}

// Merge
const merged = { ...existingCaptured, ...captured };

// Write
fs.writeFileSync('postman/captured-responses.json', JSON.stringify(merged, null, 2));

console.log(`✓ Token restored from cache (expires at ${cache.expires_at})`);
