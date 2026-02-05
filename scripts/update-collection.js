#!/usr/bin/env node

/**
 * update-collection.js
 *
 * Updates a Postman collection with request body and response data.
 * Handles nested folder structures recursively.
 */

const fs = require('fs');
const path = require('path');
const { getCollection, findEndpointByName: findEndpointCached } = require('./collection-cache');

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
const bodyPath = 'postman/current-body.json';
const responsePath = 'postman/current-response-clean.json';
const outputPath = 'postman/populated-collection.json';

// Read files
let collection, bodyContent, responseData;

try {
  // Use cached collection (loads once, cached for 60s)
  collection = getCollection();
  bodyContent = JSON.parse(fs.readFileSync(bodyPath, 'utf8'));
  responseData = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
} catch (error) {
  console.error(`Error reading files: ${error.message}`);
  process.exit(1);
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

/**
 * Replace path parameter placeholders with actual values from captured-responses.json
 * This makes the collection show the actual request that was made
 */
function replacePathParamsWithActualValues(endpoint, targetName, capturedResponses) {
  if (!endpoint.request?.url?.raw) return endpoint;

  let url = endpoint.request.url.raw;

  // Comprehensive mapping of endpoint names to their path parameter dependencies
  const paramMappings = {
    // Gym-related endpoints
    "Get a gym by ID": { "gymId": "Create a new gym.gymId" },
    "Update a gym": { "gymId": "Create a new gym.gymId" },
    "Delete a gym": { "gymId": "Create a new gym.gymId" },
    "Get gym dashboard analytics": { "gymId": "Create a new gym.gymId" },
    "Get gym member analytics": { "gymId": "Create a new gym.gymId" },
    "Get gym attendance analytics": { "gymId": "Create a new gym.gymId" },

    // Branch-related endpoints
    "Get a branch by ID": { "branchId": "Create a branch for a gym.branchId" },
    "Update a branch": { "branchId": "Create a branch for a gym.branchId" },
    "Delete a branch": { "branchId": "Create a branch for a gym.branchId" },
    "Get branch dashboard analytics": { "branchId": "Create a branch for a gym.branchId" },
    "Get branch member analytics": { "branchId": "Create a branch for a gym.branchId" },
    "Get branch attendance analytics": { "branchId": "Create a branch for a gym.branchId" },

    // Member-related endpoints
    "Get a member by ID": { "id": "Create a new member.id" },
    "Update a member": { "id": "Create a new member.id" },
    "Delete a member": { "id": "Create a new member.id" },
    "Admin update a member": { "id": "Create a new member.id" },
    "Get member dashboard data": { "id": "Create a new member.id" },

    // Trainer-related endpoints
    "Get a trainer by ID": { "id": "Create a new trainer.id" },
    "Update a trainer": { "id": "Create a new trainer.id" },
    "Delete a trainer": { "id": "Create a new trainer.id" },
    "Get trainer dashboard analytics": { "id": "Create a new trainer.id" },

    // Class-related endpoints
    "Get a class by ID": { "classId": "Create a new class.classId" },
    "Update a class": { "classId": "Create a new class.classId" },
    "Delete a class": { "classId": "Create a new class.classId" },

    // Subscription-related endpoints
    "Get a subscription by ID": { "id": "Create a new membership subscription.id" },
    "Update a subscription": { "id": "Create a new membership subscription.id" },
    "Delete a subscription": { "id": "Create a new membership subscription.id" },
    "Cancel a subscription": { "id": "Create a new membership subscription.id" },

    // Invoice-related endpoints
    "Get invoice by ID": { "invoiceId": "Create invoice.invoiceId" },
    "Update invoice": { "invoiceId": "Create invoice.invoiceId" },
    "Delete an invoice": { "invoiceId": "Create invoice.invoiceId" },
    "Cancel invoice": { "invoiceId": "Create invoice.invoiceId" },

    // Payment-related endpoints
    "Get a payment by ID": { "transactionId": "Record payment.transactionId" },

    // Assignment-related endpoints
    "Get an assignment by ID": { "assignmentId": "Assign a member to a trainer.assignmentId" },
    "Delete an assignment": { "assignmentId": "Assign a member to a trainer.assignmentId" },

    // Attendance-related endpoints
    "Get attendance record by ID": { "id": "Mark attendance (check-in).id" },
    "Check out": { "id": "Mark attendance (check-in).id" },

    // Inquiry-related endpoints
    "Get inquiry by ID": { "id": "Create a new inquiry (Public).id" },
    "Update an inquiry": { "id": "Create a new inquiry (Public).id" },
    "Delete an inquiry": { "id": "Create a new inquiry (Public).id" },

    // Body progress-related endpoints
    "Get body progress record by ID": { "id": "Create a new body progress record.id" },
    "Update a body progress record": { "id": "Create a new body progress record.id" },
    "Delete a body progress record": { "id": "Create a new body progress record.id" },

    // Diet plan-related endpoints
    "Get a diet plan by ID": { "planId": "Create a new diet plan.planId" },
    "Update a diet plan": { "planId": "Create a new diet plan.planId" },
    "Delete a diet plan": { "planId": "Create a new diet plan.planId" },

    // Diet template-related endpoints
    "Get a diet template by ID": { "templateId": "Create a diet template (trainer/admin only).planId" },
    "Update a diet template": { "templateId": "Create a diet template (trainer/admin only).planId" },
    "Delete a diet template": { "templateId": "Create a diet template (trainer/admin only).planId" },

    // Diet assignment-related endpoints
    "Get a diet assignment by ID": { "assignmentId": "Assign diet plan to a member (trainer/admin only).assignmentId" },
    "Update a diet assignment": { "assignmentId": "Assign diet plan to a member (trainer/admin only).assignmentId" },
    "Cancel a diet assignment": { "assignmentId": "Assign diet plan to a member (trainer/admin only).assignmentId" },

    // Workout log-related endpoints
    "Get a workout log by ID": { "id": "Create a new workout log.id" },
    "Update a workout log": { "id": "Create a new workout log.id" },
    "Delete a workout log": { "id": "Create a new workout log.id" },

    // Workout template-related endpoints
    "Get a workout template by ID": { "templateId": "Create a workout template (trainer/admin only).planId" },
    "Update a workout template": { "templateId": "Create a workout template (trainer/admin only).planId" },
    "Delete a workout template": { "templateId": "Create a workout template (trainer/admin only).planId" },

    // Workout plan-related endpoints
    "Get a workout plan by ID": { "planId": "Create a workout plan for a member.planId" },
    "Update a workout plan": { "planId": "Create a workout plan for a member.planId" },
    "Delete a workout plan": { "planId": "Create a workout plan for a member.planId" },

    // Goal-related endpoints
    "Get a goal by ID": { "id": "Create a new goal.id" },
    "Update a goal": { "id": "Create a new goal.id" },
    "Delete a goal": { "id": "Create a new goal.id" },

    // Goal template-related endpoints
    "Get a goal template by ID": { "templateId": "Create a goal template.templateId" },
    "Update a goal template": { "templateId": "Create a goal template.templateId" },
    "Delete a goal template": { "templateId": "Create a goal template.templateId" },

    // Goal schedule-related endpoints
    "Get a goal schedule by ID": { "scheduleId": "Create a goal schedule for a member.scheduleId" },
    "Update a goal schedule": { "scheduleId": "Create a goal schedule for a member.scheduleId" },
    "Delete a goal schedule": { "scheduleId": "Create a goal schedule for a member.scheduleId" },

    // Exercise-related endpoints
    "Get an exercise by ID": { "exerciseId": "Create a new exercise.exerciseId" },
    "Update an exercise": { "exerciseId": "Create a new exercise.exerciseId" },
    "Delete an exercise": { "exerciseId": "Create a new exercise.exerciseId" },

    // Template share-related endpoints
    "Get a shared template by ID": { "shareId": "Share a template.shareId" },
    "Accept a shared template": { "shareId": "Share a template.shareId" },
    "Reject a shared template": { "shareId": "Share a template.shareId" },

    // Template assignment-related endpoints
    "Get a template assignment by ID": { "assignmentId": "Create a template assignment.assignmentId" },
    "Update a template assignment": { "assignmentId": "Create a template assignment.assignmentId" },
    "Cancel a template assignment": { "assignmentId": "Create a template assignment.assignmentId" },

    // Role-related endpoints
    "Get role by ID": { "id": "Create a new role.id" },
    "Update a role": { "id": "Create a new role.id" },
    "Delete a role": { "id": "Create a new role.id" },

    // User-related endpoints
    "Get a user by ID": { "userid": "Create a new user.userId" },
    "Update a user": { "userid": "Create a new user.userId" },
    "Delete a user": { "userid": "Create a new user.userId" },

    // Membership plan-related endpoints
    "Get a membership plan by ID": { "id": "Create a new membership plan.id" },
    "Update a membership plan": { "id": "Create a new membership plan.id" },
    "Delete a membership plan": { "id": "Create a new membership plan.id" },
  };

  const mapping = paramMappings[targetName];
  if (!mapping) return endpoint;

  // For each path parameter, replace with actual value
  for (const [param, capturedKey] of Object.entries(mapping)) {
    // Get the actual value from captured-responses.json
    const keys = capturedKey.split('.');
    let value = capturedResponses;
    for (const key of keys) {
      value = value?.[key];
    }

    if (!value) continue;

    // Replace :param style or {{param}} style with actual value
    url = url.replace(`:${param}`, value);
    url = url.replace(`{{${param}}}`, value);

    // Update the URL structure
    if (Array.isArray(endpoint.request.url.path)) {
      const paramIndex = endpoint.request.url.path.findIndex(p => p === `:${param}` || p === `{{${param}}}`);
      if (paramIndex !== -1) {
        endpoint.request.url.path[paramIndex] = value;
      }
    }

    // Update variables if present
    if (endpoint.request.url.variable) {
      const variable = endpoint.request.url.variable.find(v => v.key === param);
      if (variable) {
        variable.value = value;
      }
    }
  }

  endpoint.request.url.raw = url;
  return endpoint;
}

// Find the endpoint using cached index (O(1) lookup)
const endpoint = findEndpointCached(targetName);

if (!endpoint) {
  console.error(`Error: Endpoint "${targetName}" not found in collection`);
  console.log('Available endpoints:');
  listEndpoints(collection.item, 0);
  process.exit(1);
}

// Read captured-responses.json to get actual IDs
let capturedResponses = {};
try {
  capturedResponses = JSON.parse(fs.readFileSync('postman/captured-responses.json', 'utf8'));
} catch (e) {
  // File doesn't exist, continue without it
}

// Update the endpoint
cleanGarbageData(endpoint);
replacePathParamsWithActualValues(endpoint, targetName, capturedResponses);
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
  updateRequestBody,
  addResponseExample,
  cleanGarbageData,
  stripQueryParams,
  replaceHardcodedPathParams,
  removeHardcodedIdsFromBody,
  replacePathParamsWithActualValues
};
