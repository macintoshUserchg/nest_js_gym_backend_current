/**
 * collection-buffer.js
 *
 * Buffer collection updates and flush once at end of pipeline.
 * Eliminates redundant 4.3MB file writes for each endpoint.
 *
 * Usage:
 *   const buffer = require('./collection-buffer');
 *
 *   // Queue an update for an endpoint
 *   buffer.queueUpdate('Get all gyms', bodyData, responseData);
 *
 *   // Check if there are pending updates
 *   if (buffer.hasPending()) { ... }
 *
 *   // Write all pending updates to collection (call once at end)
 *   buffer.flushUpdates();
 */

const fs = require('fs');
const path = require('path');
const { getCollection, buildEndpointIndex, invalidateCache: invalidateCollectionCache } = require('./collection-cache');

let pendingUpdates = [];
const OUTPUT_PATH = path.resolve(__dirname, '../postman/populated-collection.json');

/**
 * Queue an endpoint update for batch processing
 * @param {string} endpointName - Name of the endpoint
 * @param {object} body - Request body data
 * @param {object} response - Response data
 */
function queueUpdate(endpointName, body, response) {
  pendingUpdates.push({
    endpointName,
    body,
    response,
    timestamp: Date.now()
  });
}

/**
 * Check if there are pending updates
 * @returns {boolean} True if there are pending updates
 */
function hasPending() {
  return pendingUpdates.length > 0;
}

/**
 * Get count of pending updates
 * @returns {number} Number of pending updates
 */
function getPendingCount() {
  return pendingUpdates.length;
}

/**
 * Clear all pending updates without writing (for error recovery)
 */
function clearPending() {
  pendingUpdates = [];
}

/**
 * Flush all pending updates to the collection file
 * Writes the entire collection once with all accumulated updates
 */
function flushUpdates() {
  if (pendingUpdates.length === 0) {
    return;
  }

  try {
    const collection = getCollection();
    const index = buildEndpointIndex();

    // Apply all pending updates
    for (const update of pendingUpdates) {
      const endpoint = index[update.endpointName];

      if (!endpoint) {
        console.warn(`WARNING: Endpoint "${update.endpointName}" not found in collection, skipping update`);
        continue;
      }

      // Update request body
      if (endpoint.request && endpoint.request.body) {
        const bodyString = typeof update.body === 'string'
          ? update.body
          : JSON.stringify(update.body, null, 2);

        if (endpoint.request.body.raw) {
          endpoint.request.body.raw = bodyString;
        }
      }

      // Add or update response example
      if (!endpoint.response) {
        endpoint.response = [];
      }

      // Find existing response example or create new one
      let responseExample = endpoint.response.find(r => r.name === 'Example' || r.name === 'Success');

      if (!responseExample) {
        responseExample = {
          name: 'Success',
          originalRequest: endpoint.request,
          status: 'OK',
          code: 200,
          _postman_previewlanguage: 'json'
        };
        endpoint.response.push(responseExample);
      }

      // Set response body
      if (update.response) {
        const responseString = typeof update.response === 'string'
          ? update.response
          : JSON.stringify(update.response, null, 2);

        responseExample.body = responseString;
      }
    }

    // Write the entire collection once
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(collection, null, 2));

    console.log(`✓ Flushed ${pendingUpdates.length} collection update(s) to: ${OUTPUT_PATH}`);

  } catch (e) {
    console.error(`ERROR: Failed to flush collection updates: ${e.message}`);
    throw e;
  } finally {
    // Clear pending updates and invalidate cache
    pendingUpdates = [];
    invalidateCollectionCache();
  }
}

/**
 * Get list of pending endpoint names (for debugging)
 * @returns {Array<string>} Array of endpoint names
 */
function getPendingEndpoints() {
  return pendingUpdates.map(u => u.endpointName);
}

/**
 * Get cache statistics (for debugging)
 * @returns {object} Cache status info
 */
function getStats() {
  return {
    pendingCount: pendingUpdates.length,
    pendingEndpoints: getPendingEndpoints(),
    outputPath: OUTPUT_PATH
  };
}

module.exports = {
  queueUpdate,
  hasPending,
  getPendingCount,
  clearPending,
  flushUpdates,
  getPendingEndpoints,
  getStats
};
