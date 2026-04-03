const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const WATCH_DIRS = ['src/**/*.ts', 'src/**/*.js'];
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, '.jcodemunch-changes.json');

const ignored = [
  /(^|[\/\\])\../,
  'node_modules',
  'dist',
  'coverage',
  '*.spec.ts',
  '*.test.ts',
];

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return { pending: false, files: [], lastUpdated: null };
  }
}

function saveManifest(data) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2));
}

function markChanged(filePath) {
  const manifest = loadManifest();
  manifest.pending = true;
  manifest.lastUpdated = new Date().toISOString();
  if (!manifest.files.includes(filePath)) {
    manifest.files.push(filePath);
    if (manifest.files.length > 100)
      manifest.files = manifest.files.slice(-100);
  }
  saveManifest(manifest);
}

function clearManifest() {
  saveManifest({ pending: false, files: [], lastUpdated: null });
}

// If run with --clear flag, reset the manifest
if (process.argv.includes('--clear')) {
  clearManifest();
  console.log('\x1b[32m[jcodemunch]\x1b[0m Manifest cleared');
  process.exit(0);
}

const watcher = chokidar.watch(WATCH_DIRS, {
  cwd: PROJECT_ROOT,
  ignored,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
});

watcher
  .on('add', (fp) => {
    console.log(`\x1b[36m[jcodemunch]\x1b[0m + ${fp}`);
    markChanged(fp);
  })
  .on('change', (fp) => {
    console.log(`\x1b[36m[jcodemunch]\x1b[0m ~ ${fp}`);
    markChanged(fp);
  })
  .on('unlink', (fp) => {
    console.log(`\x1b[36m[jcodemunch]\x1b[0m - ${fp}`);
    markChanged(fp);
  });

console.log('\x1b[36m[jcodemunch]\x1b[0m Watching src/ for changes...');
console.log(
  '\x1b[90m          Changes tracked in .jcodemunch-changes.json\x1b[0m',
);
console.log(
  '\x1b[90m          Ask the assistant to re-index when ready\x1b[0m',
);
console.log(
  '\x1b[90m          Ctrl+C to stop | node scripts/watch-reindex.js --clear to reset\x1b[0m',
);
