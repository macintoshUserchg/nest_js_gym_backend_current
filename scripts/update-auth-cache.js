#!/usr/bin/env node

const fs = require('fs');

// Read login response from current-response-clean.json
const loginResponse = JSON.parse(fs.readFileSync('postman/current-response-clean.json', 'utf8'));

// Calculate expiration (24 hours from now per CLAUDE.md JWT_EXPIRATION)
const now = new Date();
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

// Build cache object
const cache = {
  token: loginResponse.access_token,
  userid: loginResponse.userid,
  email: loginResponse.email,
  role: loginResponse.role?.name || 'ADMIN',
  cached_at: now.toISOString(),
  expires_at: expiresAt.toISOString()
};

// Write cache file
fs.writeFileSync('postman/auth-cache.json', JSON.stringify(cache, null, 2));

console.log(`✓ Token cached (expires at ${expiresAt.toISOString()})`);
