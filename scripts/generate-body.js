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

// --- Parse CLI args ---
const itemIndex = process.argv.indexOf('--item');
const schemaIndex = process.argv.indexOf('--schema');

if (itemIndex === -1 || !process.argv[itemIndex + 1]) {
  console.error('ERROR: Missing --item flag.');
  console.error('Usage: node scripts/generate-body.js --item "Create Post" --schema \'{"field":"rule"}\'');
  process.exit(1);
}
if (schemaIndex === -1 || !process.argv[schemaIndex + 1]) {
  console.error('ERROR: Missing --schema flag.');
  process.exit(1);
}

const itemName = process.argv[itemIndex + 1];
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

// --- Generate the body ---
const body = {};
for (const [key, rule] of Object.entries(schema)) {
  body[key] = resolveRule(rule);
}

// --- Write output ---
const outputPath = path.resolve(__dirname, '../postman/current-body.json');
fs.writeFileSync(outputPath, JSON.stringify(body, null, 2));

console.log('Generated body for:', itemName);
console.log(JSON.stringify(body, null, 2));
