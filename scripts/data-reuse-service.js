/**
 * data-reuse-service.js
 *
 * Queries existing data from the live API before creating new records.
 * Implements smart reuse strategies based on entity-registry.json.
 *
 * Usage:
 *   node scripts/data-reuse-service.js --entity "Gym" --token "<jwt>"
 *
 * Output:
 *   postman/existing-data.json
 *   {
 *     "Gym": [
 *       { "gymId": "...", "name": "Fitness First Elite", ... }
 *     ]
 *   }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { findEndpointByName: findEndpointCached } = require('./collection-cache');
const { getEntityRegistry } = require('./config-cache');

// --- Parse CLI args ---
const entityArg = process.argv.indexOf('--entity');
const tokenArg = process.argv.indexOf('--token');
const refreshArg = process.argv.indexOf('--refresh');

const entity = entityArg !== -1 ? process.argv[entityArg + 1] : null;
const token = tokenArg !== -1 ? process.argv[tokenArg + 1] : null;
const refresh = refreshArg !== -1;

if (!entity) {
  console.error('ERROR: Missing --entity flag.');
  console.error('Usage: node scripts/data-reuse-service.js --entity "Gym" --token "<jwt>"');
  process.exit(1);
}

if (!token) {
  console.error('ERROR: Missing --token flag.');
  console.error('Usage: node scripts/data-reuse-service.js --entity "Gym" --token "<jwt>"');
  process.exit(1);
}

// --- Read entity registry (using config cache for performance) ---
// OPTIMIZED: Uses config cache instead of reading file every time
let registry;
try {
  registry = getEntityRegistry();
} catch (e) {
  console.error('ERROR: Failed to load entity registry:', e.message);
  process.exit(1);
}

const entityConfig = registry.entities[entity];

if (!entityConfig) {
  console.error(`ERROR: Entity "${entity}" not found in entity-registry.json.`);
  console.error('Available entities:', Object.keys(registry.entities).join(', '));
  process.exit(1);
}

// --- Check existing cache (unless --refresh flag) ---
// FIXED: Single read instead of double read (was reading again at line 125)
const existingDataPath = path.resolve(__dirname, '../postman/existing-data.json');
let existingData = {};

if (fs.existsSync(existingDataPath)) {
  try {
    existingData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));
    if (!refresh && existingData[entity] && existingData[entity].length > 0) {
      console.log(`ℹ️  Using cached ${entity} data (${existingData[entity].length} records).`);
      console.log(`   Run with --refresh to query fresh data from API.`);
      console.log(JSON.stringify(existingData, null, 2));
      process.exit(0);
    }
  } catch (e) {
    console.warn('WARNING: existing-data.json exists but is invalid. Re-fetching...');
    existingData = {};
  }
}

// --- Find the collection endpoint using cached index ---
const collectionEndpointName = entityConfig.collectionEndpoint;
const endpoint = findEndpointCached(collectionEndpointName);

if (!endpoint) {
  console.error(`ERROR: Collection endpoint "${collectionEndpointName}" not found in collection`);
  console.error('Available endpoints:', Object.keys(require('./collection-cache').buildEndpointIndex()).join(', '));
  process.exit(1);
}

// --- Extract URL from Postman format ---
let url;
if (typeof endpoint.request.url === 'string') {
  url = endpoint.request.url;
} else {
  url = endpoint.request.url.raw;
}

// Replace {{baseUrl}} with actual server URL
url = url.replace('{{baseUrl}}', 'http://localhost:3000');

// Strip query parameters to get ALL records (not filtered)
// We want the full list for data reuse, not a filtered subset
const urlWithoutQuery = url.split('?')[0];

console.log(`🔍 Querying ${collectionEndpointName} for existing ${entity} records...`);
console.log(`   URL: ${urlWithoutQuery}`);

// --- Hit the API ---
try {
  const response = execSync(
    `curl -s -X GET "${urlWithoutQuery}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json"`,
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const data = JSON.parse(response);

  if (!Array.isArray(data)) {
    console.warn(`WARNING: Response is not an array. Received:`, typeof data);
  }

  const count = Array.isArray(data) ? data.length : 1;

  // --- Store existing data ---
  // FIXED: Reuse existingData from single read above (no duplicate file read)

  existingData[entity] = data;
  fs.writeFileSync(existingDataPath, JSON.stringify(existingData, null, 2));

  console.log(`✅ Found ${count} existing ${entity} record(s)`);

  if (count > 0) {
    const displayField = entityConfig.displayField;
    const idField = entityConfig.idField;

    console.log('');
    console.log('Available records:');
    if (Array.isArray(data)) {
      data.slice(0, 10).forEach((record, i) => {
        const name = record[displayField] || record[idField] || '(unnamed)';
        const id = record[idField];
        console.log(`  [${i + 1}] ${name} (${idField}: ${id})`);
      });
      if (count > 10) {
        console.log(`  ... and ${count - 10} more`);
      }
    }
  }

  console.log('');
  console.log(`💾 Saved to: postman/existing-data.json`);

} catch (error) {
  // If curl fails, it might be a non-zero exit code
  if (error.stderr) {
    const stderr = error.stderr.toString();
    if (stderr.includes('curl') || stderr.includes('HTTP') || stderr.includes('Could not resolve')) {
      console.error('ERROR: Failed to connect to API.');
      console.error('Make sure the server is running: npm run start:dev');
      process.exit(1);
    }
  }

  // Try to parse any partial response
  try {
    const data = JSON.parse(error.stdout);
    existingData[entity] = data;
    fs.writeFileSync(existingDataPath, JSON.stringify(existingData, null, 2));
    console.log(`✅ Found ${Array.isArray(data) ? data.length : 1} existing ${entity} record(s)`);
  } catch (e) {
    console.error('ERROR: Failed to query API or parse response.');
    console.error('Details:', error.message);
    process.exit(1);
  }
}
