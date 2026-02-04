#!/usr/bin/env node

const fs = require('fs');

const CACHE_FILE = 'postman/auth-cache.json';

// Check if cache file exists
if (!fs.existsSync(CACHE_FILE)) {
  console.log(JSON.stringify({ valid: false, reason: 'Cache file not found' }));
  process.exit(1);
}

try {
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

  // Check if token exists
  if (!cache.token || !cache.expires_at) {
    console.log(JSON.stringify({ valid: false, reason: 'Invalid cache structure' }));
    process.exit(1);
  }

  // Check expiration
  const now = new Date();
  const expiresAt = new Date(cache.expires_at);

  if (now >= expiresAt) {
    console.log(JSON.stringify({
      valid: false,
      reason: 'Token expired',
      expires_at: cache.expires_at
    }));
    process.exit(1);
  }

  // Token is valid
  console.log(JSON.stringify({
    valid: true,
    token: cache.token,
    userid: cache.userid,
    email: cache.email,
    role: cache.role,
    expires_at: cache.expires_at
  }));
  process.exit(0);

} catch (error) {
  console.log(JSON.stringify({ valid: false, reason: error.message }));
  process.exit(1);
}
