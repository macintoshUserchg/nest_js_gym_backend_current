#!/usr/bin/env node

/**
 * update-collection.js
 *
 * Updates a Postman collection with request body and response data.
 * Handles nested folder structures recursively.
 */

const fs = require('fs');
const path = require('path');

// Parse CLI arguments
const args = process.argv.slice(2);
const targetIndex = args.indexOf('--target');

let targetName;

if (targetIndex !== -1 && args[targetIndex + 1]) {
  // Format: --target "Endpoint Name"
  targetName = args[targetIndex + 1];
} else {
  // Format: --target="Endpoint Name"
  targetName = args.find(arg => arg.startsWith('--target='))?.split('=')[1];
}

if (!targetName) {
  console.error('Error: --target \"Endpoint Name\" is required');
  console.error('Usage: node scripts/update-collection.js --target "User login"');
  process.exit(1);
}

// File paths
const collectionPath = fs.existsSync('postman/populated-collection.json')
  ? 'postman/populated-collection.json'
  : 'postman/raw-collection.json';
const bodyPath = 'postman/current-body.json';
const responsePath = 'postman/current-response-clean.json';
const outputPath = 'postman/populated-collection.json';

// Read files
let collection, bodyContent, responseData;

try {
  collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  bodyContent = JSON.parse(fs.readFileSync(bodyPath, 'utf8'));
  responseData = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
} catch (error) {
  console.error(`Error reading files: ${error.message}`);
  process.exit(1);
}

/**
 * Recursively search for an endpoint by name
 * Handles nested folder structures in Postman collections
 */
function findEndpointByName(items, name) {
  for (const item of items) {
    // Check if this is the target endpoint
    if (item.name === name && item.request) {
      return item;
    }

    // Recursively search in nested items (folders)
    if (item.item && Array.isArray(item.item)) {
      const found = findEndpointByName(item.item, name);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Update the request body of an endpoint
 */
function updateRequestBody(endpoint, bodyContent) {
  const bodyString = JSON.stringify(bodyContent, null, 2);

  if (endpoint.request?.body?.mode === 'raw') {
    endpoint.request.body.raw = bodyString;
  } else if (endpoint.request?.body) {
    endpoint.request.body.mode = 'raw';
    endpoint.request.body.raw = bodyString;
    endpoint.request.body.options = {
      raw: {
        language: 'json'
      }
    };
  }

  return endpoint;
}

/**
 * Add or update a response example
 */
function addResponseExample(endpoint, responseData, statusCode = 200) {
  // Create response example
  const responseExample = {
    name: `Example ${new Date().toISOString()}`,
    originalRequest: {
      method: endpoint.request.method,
      header: endpoint.request.header || [],
      body: endpoint.request.body,
      url: endpoint.request.url
    },
    status: 'OK',
    code: statusCode,
    _postman_previewlanguage: 'json',
    header: [
      {
        key: 'Content-Type',
        value: 'application/json'
      }
    ],
    cookie: [],
    body: JSON.stringify(responseData, null, 2)
  };

  // Initialize response array if it doesn't exist
  if (!Array.isArray(endpoint.response)) {
    endpoint.response = [];
  }

  // Update first response example or add new one
  if (endpoint.response.length > 0) {
    endpoint.response[0] = responseExample;
  } else {
    endpoint.response.push(responseExample);
  }

  return endpoint;
}

// Find the endpoint
const endpoint = findEndpointByName(collection.item, targetName);

if (!endpoint) {
  console.error(`Error: Endpoint "${targetName}" not found in collection`);
  console.log('Available endpoints:');
  listEndpoints(collection.item, 0);
  process.exit(1);
}

// Update the endpoint
updateRequestBody(endpoint, bodyContent);
addResponseExample(endpoint, responseData);

// Write updated collection
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log(`✓ Updated endpoint: ${targetName}`);
console.log(`✓ Collection saved to: ${outputPath}`);

/**
 * Helper to list all endpoints for debugging
 */
function listEndpoints(items, depth) {
  const indent = '  '.repeat(depth);
  for (const item of items) {
    if (item.request) {
      console.log(`${indent}- ${item.name}`);
    }
    if (item.item && Array.isArray(item.item)) {
      listEndpoints(item.item, depth + 1);
    }
  }
}

module.exports = { findEndpointByName, updateRequestBody, addResponseExample };
