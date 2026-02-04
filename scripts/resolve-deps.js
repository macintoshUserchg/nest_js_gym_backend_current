/**
 * resolve-deps.js
 * 
 * Reads dep-graph.json, takes a target endpoint name,
 * walks dependencies recursively, runs topological sort,
 * outputs the exact run order to resolved-run-order.json.
 * 
 * Usage:
 *   node scripts/resolve-deps.js --target "Create Post"
 * 
 * Output:
 *   postman/resolved-run-order.json
 *   { "supportEndpoints": ["Login", "Create User"], "target": "Create Post" }
 */

const fs = require('fs');
const path = require('path');

// --- Read dep graph ---
const depGraphPath = path.resolve(__dirname, '../postman/dep-graph.json');
if (!fs.existsSync(depGraphPath)) {
  console.error('ERROR: postman/dep-graph.json not found. Create it manually — see CLAUDE.md for format.');
  process.exit(1);
}
const depGraph = JSON.parse(fs.readFileSync(depGraphPath, 'utf-8'));

// --- Get target from CLI args ---
const targetIndex = process.argv.indexOf('--target');
if (targetIndex === -1 || !process.argv[targetIndex + 1]) {
  console.error('ERROR: Missing --target flag.');
  console.error('Usage: node scripts/resolve-deps.js --target "Create Post"');
  console.error('\nAvailable endpoints:');
  Object.keys(depGraph).forEach(ep => console.error(`  - ${ep}`));
  process.exit(1);
}
const target = process.argv[targetIndex + 1];

// --- Validate target exists in graph ---
if (!depGraph[target]) {
  console.error(`ERROR: "${target}" not found in dep-graph.json.`);
  console.error('\nAvailable endpoints:');
  Object.keys(depGraph).forEach(ep => console.error(`  - ${ep}`));
  process.exit(1);
}

// --- Collect all edges recursively ---
// toposort needs edges in [dependent, dependency] format
// "A depends on B" → [A, B]
const edges = [];
const visited = new Set();

function collectDeps(endpoint) {
  if (visited.has(endpoint)) return; // already processed — avoids infinite loops
  visited.add(endpoint);

  const deps = depGraph[endpoint] || [];
  for (const dep of deps) {
    if (!depGraph[dep]) {
      console.error(`ERROR: "${endpoint}" depends on "${dep}", but "${dep}" is not defined in dep-graph.json.`);
      process.exit(1);
    }
    edges.push([endpoint, dep]); // endpoint depends on dep
    collectDeps(dep);            // recurse — dep might have its own deps
  }
}

collectDeps(target);

// --- Topological sort ---
// If target has zero deps, just run target alone
if (edges.length === 0) {
  const result = { supportEndpoints: [], target };
  fs.writeFileSync(
    path.resolve(__dirname, '../postman/resolved-run-order.json'),
    JSON.stringify(result, null, 2)
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// Simple topological sort (no external dependency needed)
// Kahn's algorithm
function toposort(edges) {
  // Build adjacency list and in-degree map
  const graph = {};      // node → [nodes it points to]
  const inDegree = {};   // node → number of incoming edges

  // Collect all nodes
  const allNodes = new Set();
  for (const [from, to] of edges) {
    allNodes.add(from);
    allNodes.add(to);
  }
  for (const node of allNodes) {
    graph[node] = [];
    inDegree[node] = 0;
  }

  // "from depends on to" means to must run BEFORE from
  // So edge direction for execution order: to → from
  for (const [from, to] of edges) {
    graph[to].push(from);  // to points to from (to runs first)
    inDegree[from]++;
  }

  // Start with nodes that have no dependencies (inDegree === 0)
  const queue = [];
  for (const node of allNodes) {
    if (inDegree[node] === 0) queue.push(node);
  }

  const sorted = [];
  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  // If sorted doesn't contain all nodes, there's a cycle
  if (sorted.length !== allNodes.size) {
    console.error('ERROR: Circular dependency detected in dep-graph.json.');
    console.error('Check your dependency definitions for cycles.');
    process.exit(1);
  }

  return sorted;
}

const sorted = toposort(edges);

// sorted is now: deepest dependency first → target last
// Remove the target itself — it runs separately as the TARGET
const supportEndpoints = sorted.filter(ep => ep !== target);

const result = { supportEndpoints, target };

fs.writeFileSync(
  path.resolve(__dirname, '../postman/resolved-run-order.json'),
  JSON.stringify(result, null, 2)
);

console.log(JSON.stringify(result, null, 2));
