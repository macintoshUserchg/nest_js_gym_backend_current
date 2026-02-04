/**
 * generate-body.js
 * 
 * Generates a realistic request body for a given endpoint using Faker.js.
 * Reads captured-responses.json to pull real IDs from previously-run dependency endpoints.
 * 
 * Usage:
 *   node scripts/generate-body.js --item "Create Post" --schema '{"title":"faker:lorem.sentence","userId":"ref:Create User.id","status":"enum:draft,published,archived"}'
 * 
 * Schema syntax:
 *   "faker:<method>"        → calls that faker method. e.g. faker:internet.email, faker:person.fullName, faker:lorem.sentence
 *   "ref:<endpoint>.<field>" → pulls <field> from captured-responses.json["<endpoint>"]
 *   "enum:<val1>,<val2>"    → randomly picks one value
 *   "static:<value>"        → uses the literal string value as-is
 *   "faker:number"          → generates a random integer (special shortcut)
 * 
 * Output:
 *   postman/current-body.json
 * 
 * Requires: npm install @faker-js/faker
 */

const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Parse CLI args ---
const itemIndex = process.argv.indexOf('--item');
const schemaIndex = process.argv.indexOf('--schema');
const interactiveIndex = process.argv.indexOf('--interactive') !== -1 || process.argv.indexOf('-i') !== -1;

if (itemIndex === -1 || !process.argv[itemIndex + 1]) {
  console.error('ERROR: Missing --item flag.');
  console.error('Usage: node scripts/generate-body.js --item "Create Post" --schema \'{"field":"rule"}\' [--interactive]');
  process.exit(1);
}
if (schemaIndex === -1 || !process.argv[schemaIndex + 1]) {
  console.error('ERROR: Missing --schema flag.');
  process.exit(1);
}

const itemName = process.argv[itemIndex + 1];
const isInteractive = interactiveIndex;
let schema;
try {
  schema = JSON.parse(process.argv[schemaIndex + 1]);
} catch (e) {
  console.error('ERROR: --schema is not valid JSON.');
  console.error('Received:', process.argv[schemaIndex + 1]);
  process.exit(1);
}

// --- Read captured responses (for ref: lookups) ---
const capturedPath = path.resolve(__dirname, '../postman/captured-responses.json');
let captured = {};
if (fs.existsSync(capturedPath)) {
  try {
    captured = JSON.parse(fs.readFileSync(capturedPath, 'utf-8'));
  } catch (e) {
    console.error('WARNING: captured-responses.json exists but is not valid JSON. Treating as empty.');
  }
}

// --- Read existing data (for data reuse) ---
const existingDataPath = path.resolve(__dirname, '../postman/existing-data.json');
let existingData = {};
if (fs.existsSync(existingDataPath)) {
  try {
    existingData = JSON.parse(fs.readFileSync(existingDataPath, 'utf-8'));
  } catch (e) {
    console.warn('WARNING: existing-data.json exists but is not valid JSON. Data reuse disabled.');
  }
}

// --- Read entity registry (for data reuse metadata) ---
const registryPath = path.resolve(__dirname, '../postman/entity-registry.json');
let entityRegistry = { entities: {}, defaultReuse: {} };
if (fs.existsSync(registryPath)) {
  try {
    entityRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (e) {
    console.warn('WARNING: entity-registry.json exists but is not valid JSON.');
  }
}

// --- Helper to find entity by collection endpoint ---
function getEntityByCollectionEndpoint(endpointName) {
  for (const [entityName, config] of Object.entries(entityRegistry.entities)) {
    if (config.collectionEndpoint === endpointName) {
      return { name: entityName, ...config };
    }
  }
  return null;
}

// --- Helper to get existing data for an entity ---
function getExistingDataForEntity(entityName) {
  if (!existingData[entityName]) {
    return [];
  }
  return Array.isArray(existingData[entityName]) ? existingData[entityName] : [existingData[entityName]];
}

// --- Helper to prompt user for data reuse (interactive mode) ---
function promptForReuse(entityName, options) {
  try {
    const entityConfig = entityRegistry.entities[entityName];
    const displayField = entityConfig?.displayField || 'name';
    const idField = entityConfig?.idField || 'id';

    // Build options with idField for display
    const optionsWithId = options.map(opt => ({
      ...opt,
      idField,
      [displayField]: opt[displayField] || opt.name || '(unnamed)'
    }));

    const optionsJson = JSON.stringify(optionsWithId);
    const question = `Found ${options.length} existing ${entityName}(s). Use one or create new?`;

    execSync(
      `node scripts/interactive-prompt.js --question "${question}" --options '${optionsJson}' --entity "${entityName}" --display "${displayField}"`,
      { stdio: 'inherit' }
    );

    // Read user choice
    const choicePath = path.resolve(__dirname, '../postman/user-choice.json');
    if (fs.existsSync(choicePath)) {
      const choice = JSON.parse(fs.readFileSync(choicePath, 'utf-8'));
      if (choice.action === 'reuse') {
        return choice.data;
      }
    }
  } catch (e) {
    console.warn('Interactive prompt failed, falling back to create new.');
  }
  return null;
}

// --- Resolve a single schema rule to a value ---
function resolveRule(rule) {
  if (typeof rule !== 'string') {
    // If it's already a number or object, return as-is
    return rule;
  }

  // --- enum:<val1>,<val2>,<val3> ---
  if (rule.startsWith('enum:')) {
    const values = rule.slice(5).split(',').map(v => v.trim());
    return faker.helpers.arrayElement(values);
  }

  // --- ref:<endpoint>.<field> ---
  if (rule.startsWith('ref:')) {
    const refPath = rule.slice(4); // e.g. "Create User.id"
    const dotIndex = refPath.lastIndexOf('.');
    if (dotIndex === -1) {
      console.error(`ERROR: Invalid ref syntax "${rule}". Expected format: ref:<endpoint>.<field>`);
      process.exit(1);
    }
    const endpoint = refPath.slice(0, dotIndex);
    const field = refPath.slice(dotIndex + 1);

    if (!captured[endpoint]) {
      console.error(`ERROR: ref "${rule}" — endpoint "${endpoint}" not found in captured-responses.json.`);
      console.error('This means the dependency endpoint has not been run yet. Check your dep-graph.json.');
      process.exit(1);
    }
    if (captured[endpoint][field] === undefined) {
      console.error(`ERROR: ref "${rule}" — field "${field}" not found in captured response for "${endpoint}".`);
      console.error('Captured response was:', JSON.stringify(captured[endpoint], null, 2));
      process.exit(1);
    }
    return captured[endpoint][field];
  }

  // --- static:<value> ---
  if (rule.startsWith('static:')) {
    return rule.slice(7);
  }

  // --- faker:<method> ---
  if (rule.startsWith('faker:')) {
    const method = rule.slice(6); // e.g. "internet.email", "person.fullName"

    // Special shortcut
    if (method === 'number') {
      return faker.number.int({ min: 1, max: 10000 });
    }

    // Walk the faker object using the dot-separated path
    const parts = method.split('.');
    let fn = faker;
    for (const part of parts) {
      fn = fn[part];
      if (!fn) {
        console.error(`ERROR: faker method "faker:${method}" does not exist.`);
        console.error('Check Faker.js docs for valid methods: https://fakerjs.dev/api/');
        process.exit(1);
      }
    }

    if (typeof fn !== 'function') {
      console.error(`ERROR: "faker:${method}" resolved to a value, not a function. Add the method call.`);
      process.exit(1);
    }

    return fn();
  }

  // --- Fallback: return the raw string as-is ---
  return rule;
}

// --- Resolve a single schema rule with data reuse support ---
function resolveRuleWithReuse(rule, fieldName) {
  if (typeof rule !== 'string') {
    return resolveRule(rule);
  }

  // Check if this is a ref to a collection endpoint (data reuse opportunity)
  if (rule.startsWith('ref:')) {
    const refPath = rule.slice(4); // e.g. "Get all gyms.gymId"
    const dotIndex = refPath.lastIndexOf('.');
    if (dotIndex === -1) {
      return resolveRule(rule); // Invalid format, fall back to original
    }

    const endpoint = refPath.slice(0, dotIndex);
    const field = refPath.slice(dotIndex + 1);

    // Check if this ref points to a collection endpoint
    const entity = getEntityByCollectionEndpoint(endpoint);
    if (entity) {
      // This is a collection endpoint - check for existing data
      const existingRecords = getExistingDataForEntity(entity.name);

      if (existingRecords.length > 0) {
        const defaultReuse = entityRegistry.defaultReuse[entity.name] || 'query';

        // Skip reuse if default strategy is 'create'
        if (defaultReuse === 'create') {
          console.log(`ℹ️  [${fieldName}] Default strategy for ${entity.name} is 'create', will generate new data`);
          return resolveRule(rule);
        }

        // Interactive mode: prompt user if multiple records
        if (isInteractive && existingRecords.length > 1) {
          const selected = promptForReuse(entity.name, existingRecords);
          if (selected) {
            const idField = entity.idField;
            console.log(`♻️  [${fieldName}] Reusing existing ${entity.name}: ${selected[entity.displayField] || selected.name}`);
            return selected[field] || selected[idField];
          }
        }

        // Silent mode or single record: use first available
        const first = existingRecords[0];
        const idField = entity.idField;
        console.log(`♻️  [${fieldName}] Reusing existing ${entity.name}: ${first[entity.displayField] || first.name} (${idField}: ${first[idField]})`);
        return first[field] || first[idField];
      }
    }
  }

  // Fall back to original resolveRule
  return resolveRule(rule);
}

// --- Generate the body ---
const body = {};
for (const [key, rule] of Object.entries(schema)) {
  body[key] = resolveRuleWithReuse(rule, key);
}

// --- Write output ---
const outputPath = path.resolve(__dirname, '../postman/current-body.json');
fs.writeFileSync(outputPath, JSON.stringify(body, null, 2));

console.log('Generated body for:', itemName);
console.log(JSON.stringify(body, null, 2));
