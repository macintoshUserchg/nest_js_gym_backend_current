/**
 * config-cache.js
 *
 * Cache for static configuration files that never change during pipeline execution.
 * Eliminates redundant file reads of entity-registry.json and dep-graph.json.
 *
 * Usage:
 *   const { getEntityRegistry, getDepGraph, buildEntityLookupMap } = require('./config-cache');
 *
 *   // Get cached entity registry (loaded once)
 *   const registry = getEntityRegistry();
 *
 *   // Get cached dependency graph (loaded once)
 *   const depGraph = getDepGraph();
 *
 *   // Build O(1) lookup map for collection endpoint → entity
 *   const map = buildEntityLookupMap();
 *   const entity = map.get('Get all gyms');
 */

const fs = require('fs');
const path = require('path');

// Cached data
let entityRegistryCache = null;
let depGraphCache = null;
let entityLookupMap = null;

/**
 * Get entity registry (cached)
 * @returns {object} Parsed entity-registry.json
 */
function getEntityRegistry() {
  if (!entityRegistryCache) {
    const registryPath = path.resolve(__dirname, '../postman/entity-registry.json');
    try {
      entityRegistryCache = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (e) {
      console.error('ERROR: Failed to load entity-registry.json');
      console.error(`Details: ${e.message}`);
      process.exit(1);
    }
  }
  return entityRegistryCache;
}

/**
 * Get dependency graph (cached)
 * @returns {object} Parsed dep-graph.json
 */
function getDepGraph() {
  if (!depGraphCache) {
    const depGraphPath = path.resolve(__dirname, '../postman/dep-graph.json');
    try {
      depGraphCache = JSON.parse(fs.readFileSync(depGraphPath, 'utf8'));
    } catch (e) {
      console.error('ERROR: Failed to load dep-graph.json');
      console.error(`Details: ${e.message}`);
      process.exit(1);
    }
  }
  return depGraphCache;
}

/**
 * Build O(1) lookup map for collection endpoint → entity
 * @returns {Map} Map of collection endpoint name → entity config
 */
function buildEntityLookupMap() {
  if (entityLookupMap) {
    return entityLookupMap;
  }

  const registry = getEntityRegistry();
  const map = new Map();

  for (const [name, config] of Object.entries(registry.entities)) {
    if (config.collectionEndpoint) {
      map.set(config.collectionEndpoint, { name, ...config });
    }
  }

  entityLookupMap = map;
  return map;
}

/**
 * Get entity by collection endpoint name (O(1) lookup)
 * @param {string} endpointName - Collection endpoint name
 * @returns {object|null} Entity config or null if not found
 */
function getEntityByCollectionEndpoint(endpointName) {
  const map = buildEntityLookupMap();
  return map.get(endpointName) || null;
}

/**
 * Invalidate all caches (for testing or if files change externally)
 */
function invalidateCache() {
  entityRegistryCache = null;
  depGraphCache = null;
  entityLookupMap = null;
}

/**
 * Get cache statistics (for debugging)
 * @returns {object} Cache status info
 */
function getCacheStats() {
  return {
    entityRegistryCached: entityRegistryCache !== null,
    depGraphCached: depGraphCache !== null,
    lookupMapCached: entityLookupMap !== null
  };
}

module.exports = {
  getEntityRegistry,
  getDepGraph,
  buildEntityLookupMap,
  getEntityByCollectionEndpoint,
  invalidateCache,
  getCacheStats
};
