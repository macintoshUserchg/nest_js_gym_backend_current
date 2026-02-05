/**
 * collection-cache.js
 *
 * Shared collection cache to eliminate redundant JSON parsing.
 * Cache has 60-second TTL to prevent stale data.
 *
 * Usage:
 *   const { getCollection, buildEndpointIndex, invalidateCache } = require('./collection-cache');
 *
 *   // Get cached collection (loads once, caches for 60s)
 *   const collection = getCollection();
 *
 *   // Build O(1) endpoint lookup index
 *   const index = buildEndpointIndex();
 *   const endpoint = index['Get all gyms'];
 *
 *   // Force cache refresh
 *   const fresh = getCollection(true);
 *
 *   // Invalidate cache completely
 *   invalidateCache();
 */

const fs = require('fs');
const path = require('path');

let cachedCollection = null;
let cachedIndex = null;
let cacheTime = null;
let indexTime = null;
const CACHE_TTL = 60000; // 60 seconds

/**
 * Get the Postman collection (populated or raw)
 * @param {boolean} forceRefresh - Force reload from disk
 * @returns {object} Parsed collection object
 */
function getCollection(forceRefresh = false) {
  const now = Date.now();

  // Return cached collection if valid
  if (!forceRefresh && cachedCollection && cacheTime && (now - cacheTime < CACHE_TTL)) {
    return cachedCollection;
  }

  // Determine which collection to use
  const populatedPath = path.resolve(__dirname, '../postman/populated-collection.json');
  const fallbackPath = path.resolve(__dirname, '../postman/raw-collection.json');
  const collectionPath = fs.existsSync(populatedPath) ? populatedPath : fallbackPath;

  // Load and cache collection
  try {
    cachedCollection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    cacheTime = now;
    // Invalidate index when collection reloads
    cachedIndex = null;
    indexTime = null;
  } catch (e) {
    console.error(`ERROR: Failed to load collection from ${collectionPath}`);
    console.error(`Details: ${e.message}`);
    process.exit(1);
  }

  return cachedCollection;
}

/**
 * Build an O(1) lookup index for endpoint names
 * @returns {object} Map of endpoint name -> endpoint object
 */
function buildEndpointIndex() {
  const now = Date.now();

  // Return cached index if valid
  if (cachedIndex && indexTime && (now - indexTime < CACHE_TTL)) {
    return cachedIndex;
  }

  const collection = getCollection();
  const index = {};

  function traverse(items) {
    for (const item of items) {
      if (item.name && item.request) {
        index[item.name] = item;
      }
      if (item.item) {
        traverse(item.item);
      }
    }
  }

  try {
    traverse(collection.item);
  } catch (e) {
    console.error(`ERROR: Failed to build endpoint index`);
    console.error(`Details: ${e.message}`);
    process.exit(1);
  }

  cachedIndex = index;
  indexTime = now;

  return index;
}

/**
 * Find a specific endpoint by name (convenience function)
 * @param {string} endpointName - Name of endpoint to find
 * @returns {object|null} Endpoint object or null if not found
 */
function findEndpointByName(endpointName) {
  const index = buildEndpointIndex();
  return index[endpointName] || null;
}

/**
 * Invalidate both collection and index cache
 */
function invalidateCache() {
  cachedCollection = null;
  cachedIndex = null;
  cacheTime = null;
  indexTime = null;
}

/**
 * Get cache statistics (for debugging)
 * @returns {object} Cache status info
 */
function getCacheStats() {
  const now = Date.now();
  return {
    collectionCached: cachedCollection !== null,
    indexCached: cachedIndex !== null,
    collectionAge: cacheTime ? now - cacheTime : null,
    indexAge: indexTime ? now - indexTime : null,
    ttl: CACHE_TTL
  };
}

module.exports = {
  getCollection,
  buildEndpointIndex,
  findEndpointByName,
  invalidateCache,
  getCacheStats
};
