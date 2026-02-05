/**
 * captured-responses-cache.js
 *
 * In-memory cache for captured responses.
 * Eliminates redundant file reads/writes of captured-responses.json.
 *
 * Usage:
 *   const cache = require('./captured-responses-cache');
 *
 *   // Initialize cache from file
 *   cache.init();
 *
 *   // Get response for an endpoint
 *   const response = cache.getResponse('User login');
 *
 *   // Set response for an endpoint
 *   cache.setResponse('Get all gyms', responseData);
 *
 *   // Check if response exists
 *   if (cache.hasResponse('Get all gyms')) { ... }
 *
 *   // Write all cached responses to file
 *   cache.flush();
 */

const fs = require('fs');
const path = require('path');

let capturedData = null;
let dirty = false;

const FILE_PATH = path.resolve(__dirname, '../postman/captured-responses.json');

/**
 * Initialize cache from file
 * Loads existing captured-responses.json if it exists
 */
function init() {
  if (fs.existsSync(FILE_PATH)) {
    try {
      capturedData = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    } catch (e) {
      capturedData = {};
    }
  } else {
    capturedData = {};
  }
  dirty = false;
}

/**
 * Get response for a specific endpoint
 * @param {string} endpointName - Name of the endpoint
 * @returns {*} Response data or undefined if not found
 */
function getResponse(endpointName) {
  if (!capturedData) {
    init();
  }
  return capturedData[endpointName];
}

/**
 * Set response for a specific endpoint
 * @param {string} endpointName - Name of the endpoint
 * @param {*} response - Response data to store
 */
function setResponse(endpointName, response) {
  if (!capturedData) {
    init();
  }
  capturedData[endpointName] = response;
  dirty = true;
}

/**
 * Get all cached responses
 * @returns {object} All captured responses
 */
function getAll() {
  if (!capturedData) {
    init();
  }
  return capturedData;
}

/**
 * Check if a response exists for an endpoint
 * @param {string} endpointName - Name of the endpoint
 * @returns {boolean} True if response exists
 */
function hasResponse(endpointName) {
  if (!capturedData) {
    init();
  }
  return endpointName in capturedData;
}

/**
 * Write all cached responses to file
 * Only writes if data has been modified (dirty flag)
 */
function flush() {
  if (!capturedData || !dirty) {
    return; // No changes to write
  }

  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(capturedData, null, 2));
    dirty = false;
  } catch (e) {
    console.error(`ERROR: Failed to write captured-responses.json: ${e.message}`);
    throw e;
  }
}

/**
 * Force write even if not dirty (for compatibility)
 */
function flushForce() {
  if (!capturedData) {
    init();
  }
  dirty = true;
  flush();
}

/**
 * Clear all cached data
 */
function clear() {
  capturedData = {};
  dirty = true;
}

/**
 * Invalidate cache (requires reload from file on next access)
 */
function invalidate() {
  capturedData = null;
  dirty = false;
}

/**
 * Get cache statistics (for debugging)
 * @returns {object} Cache status info
 */
function getStats() {
  const count = capturedData ? Object.keys(capturedData).length : 0;
  return {
    initialized: capturedData !== null,
    endpointCount: count,
    dirty: dirty,
    hasData: count > 0
  };
}

module.exports = {
  init,
  getResponse,
  setResponse,
  getAll,
  hasResponse,
  flush,
  flushForce,
  clear,
  invalidate,
  getStats
};
