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
 * Strip query parameters from GET request URLs
 * This prevents hardcoded filters that don't match actual data
 */
function stripQueryParams(endpoint) {
  if (!endpoint.request?.method === 'GET') {
    return endpoint;
  }

  const url = endpoint.request.url;
  if (!url) return endpoint;

  // Get the raw URL
  const rawUrl = typeof url === 'string' ? url : url.raw;
  if (!rawUrl) return endpoint;

  // Strip query parameters
  const urlWithoutQuery = rawUrl.split('?')[0];

  // Update the URL
  if (typeof endpoint.request.url === 'string') {
    endpoint.request.url = urlWithoutQuery;
  } else {
    endpoint.request.url.raw = urlWithoutQuery;
    if (endpoint.request.url.query) {
      endpoint.request.url.query = [];
    }
  }

  return endpoint;
}

/**
 * Replace hardcoded IDs in URL paths with Postman variables
 * This makes paths dynamic and usable with real data
 */
function replaceHardcodedPathParams(endpoint) {
  if (!endpoint.request?.url) return endpoint;

  let rawUrl = typeof endpoint.request.url === 'string'
    ? endpoint.request.url
    : endpoint.request.url.raw;

  if (!rawUrl) return endpoint;

  // Path parameter to variable mappings based on common patterns
  const replacements = [
    // Gym-related paths
    { pattern: /\/gyms\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/gyms/{{gymId}}' },
    { pattern: /\/gyms\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/gyms/{{gymId}}' },

    // Branch-related paths
    { pattern: /\/branches\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/branches/{{branchId}}' },
    { pattern: /\/branches\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/branches/{{branchId}}' },

    // Class-related paths
    { pattern: /\/classes\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/classes/{{classId}}' },
    { pattern: /\/classes\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/classes/{{classId}}' },

    // Member-related paths (auto-increment IDs)
    { pattern: /\/members\/\d+(?=\/|\?|$)/g, replacement: '/members/{{memberId}}' },

    // Trainer-related paths (auto-increment IDs)
    { pattern: /\/trainers\/\d+(?=\/|\?|$)/g, replacement: '/trainers/{{trainerId}}' },

    // Assignment-related paths
    { pattern: /\/assignments\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/assignments/{{assignmentId}}' },
    { pattern: /\/assignments\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/assignments/{{assignmentId}}' },

    // Subscription-related paths (auto-increment)
    { pattern: /\/subscriptions\/\d+(?=\/|\?|$)/g, replacement: '/subscriptions/{{subscriptionId}}' },

    // Invoice-related paths
    { pattern: /\/invoices\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/invoices/{{invoiceId}}' },
    { pattern: /\/invoices\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/invoices/{{invoiceId}}' },

    // Payment-related paths
    { pattern: /\/payments\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/payments/{{paymentId}}' },
    { pattern: /\/payments\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/payments/{{paymentId}}' },

    // Attendance-related paths
    { pattern: /\/attendance\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/attendance/{{attendanceId}}' },
    { pattern: /\/attendance\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/attendance/{{attendanceId}}' },

    // Inquiry-related paths (auto-increment)
    { pattern: /\/inquiries\/\d+(?=\/|\?|$)/g, replacement: '/inquiries/{{inquiryId}}' },

    // Diet plan-related paths
    { pattern: /\/diet-plans\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/diet-plans/{{dietPlanId}}' },
    { pattern: /\/diet-plans\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/diet-plans/{{dietPlanId}}' },

    // Workout-related paths
    { pattern: /\/workouts\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/workouts/{{workoutPlanId}}' },
    { pattern: /\/workouts\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: '/workouts/{{workoutPlanId}}' },
  ];

  // Apply all replacements
  for (const { pattern, replacement } of replacements) {
    rawUrl = rawUrl.replace(pattern, replacement);
  }

  // Update the URL
  if (typeof endpoint.request.url === 'string') {
    endpoint.request.url = rawUrl;
  } else {
    endpoint.request.url.raw = rawUrl;
  }

  return endpoint;
}

/**
 * Recursively clean an object by removing fields with hardcoded IDs
 */
function cleanObject(obj, uuidPattern, suspiciousValues) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item, uuidPattern, suspiciousValues));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip fields with hardcoded UUIDs
    if (typeof value === 'string' && uuidPattern.test(value)) {
      continue;
    }

    // Skip known suspicious hardcoded values
    if (suspiciousValues.includes(value)) {
      continue;
    }

    // Skip auto-increment IDs that look like foreign keys (id fields)
    if ((key.endsWith('Id') || key.endsWith('_id')) && typeof value === 'number' && value > 0) {
      // Keep the value - it might be legitimate
    }

    // Recursively clean nested objects
    cleaned[key] = cleanObject(value, uuidPattern, suspiciousValues);
  }

  return cleaned;
}

/**
 * Remove hardcoded IDs and suspicious values from request bodies
 */
function removeHardcodedIdsFromBody(endpoint) {
  if (!endpoint.request?.body?.raw) return endpoint;

  try {
    let body = JSON.parse(endpoint.request.body.raw);

    // UUID pattern for detection
    const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$|^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

    // Known suspicious hardcoded values from the raw collection
    const suspiciousValues = [
      '123e4567-e89b-12d3-a456-426614174000',
      '03375eab-ff06-2b0b-cfc6-e717a9c9ae1a',
      '91e3e02c-8c4e-4e17-918f-803bf9583194',
      '3c08ed00-e120-47f7-9a2a-ba381681e67e',
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff'
    ];

    // Clean the body
    const cleanedBody = cleanObject(body, uuidPattern, suspiciousValues);

    // Update if changes were made
    if (JSON.stringify(cleanedBody) !== JSON.stringify(body)) {
      endpoint.request.body.raw = JSON.stringify(cleanedBody, null, 2);
    }
  } catch (e) {
    // Body isn't JSON, skip
  }

  return endpoint;
}

/**
 * Remove suspicious hardcoded enum values that don't match actual data
 * (This is now integrated into removeHardcodedIdsFromBody)
 */
function removeSuspiciousEnumValues(endpoint) {
  // This functionality is now integrated into removeHardcodedIdsFromBody
  return endpoint;
}

/**
 * Clean all garbage values from endpoint URLs and request bodies
 * This is the main entry point for all cleaning operations
 */
function cleanGarbageData(endpoint) {
  // 1. Strip query parameters from GET requests
  stripQueryParams(endpoint);

  // 2. Replace hardcoded path parameters with Postman variables
  replaceHardcodedPathParams(endpoint);

  // 3. Remove hardcoded IDs from request bodies
  removeHardcodedIdsFromBody(endpoint);

  return endpoint;
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
cleanGarbageData(endpoint);
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

module.exports = {
  findEndpointByName,
  updateRequestBody,
  addResponseExample,
  cleanGarbageData,
  stripQueryParams,
  replaceHardcodedPathParams,
  removeHardcodedIdsFromBody
};
