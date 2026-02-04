/**
 * interactive-prompt.js
 *
 * Prompts user for input when ambiguity exists.
 * Used for data reuse decisions.
 *
 * Usage:
 *   node scripts/interactive-prompt.js --question "Use existing gym?" --options '[{"id":"...","name":"..."}]' --entity "Gym"
 *
 * Output:
 *   Writes selected option to postman/user-choice.json
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// --- Parse CLI args ---
const questionIndex = process.argv.indexOf('--question');
const optionsIndex = process.argv.indexOf('--options');
const entityIndex = process.argv.indexOf('--entity');
const displayIndex = process.argv.indexOf('--display');

const questionText = questionIndex !== -1 ? process.argv[questionIndex + 1] : 'Choose an option:';
const options = optionsIndex !== -1 ? JSON.parse(process.argv[optionsIndex + 1]) : [];
const entity = entityIndex !== -1 ? process.argv[entityIndex + 1] : 'record';
const displayField = displayIndex !== -1 ? process.argv[displayIndex + 1] : 'name';

// --- Create readline interface ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('');
  console.log('🤔 ' + questionText);
  console.log('');

  if (options.length > 0) {
    const idField = options[0].idField || 'id';

    options.forEach((opt, i) => {
      const name = opt[displayField] || opt.name || opt.fullName || opt.title || JSON.stringify(opt);
      const id = opt[idField] || opt.id || '(no id)';
      console.log(`  [${i + 1}] ${name} (${idField}: ${id})`);
    });

    console.log(`  [${options.length + 1}] Create new ${entity}`);
    console.log('');

    const choice = await question('Enter choice (number): ');
    const choiceNum = parseInt(choice.trim());

    const outputPath = path.resolve(__dirname, '../postman/user-choice.json');

    if (choiceNum > 0 && choiceNum <= options.length) {
      const selected = options[choiceNum - 1];
      fs.writeFileSync(outputPath, JSON.stringify({
        action: 'reuse',
        data: selected
      }, null, 2));
      console.log('');
      console.log(`✅ Selected: ${selected[displayField] || selected.name || selected.fullName || selected.title}`);
    } else if (choiceNum === options.length + 1) {
      fs.writeFileSync(outputPath, JSON.stringify({
        action: 'create'
      }, null, 2));
      console.log('');
      console.log(`✅ Will create new ${entity}`);
    } else {
      console.log('');
      console.log('❌ Invalid choice. Please run again and enter a valid number.');
      fs.writeFileSync(outputPath, JSON.stringify({
        action: 'cancel'
      }, null, 2));
      rl.close();
      process.exit(1);
    }
  } else {
    // No existing data found
    const outputPath = path.resolve(__dirname, '../postman/user-choice.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      action: 'create'
    }, null, 2));
    console.log(`ℹ️  No existing ${entity} found. Will create new.`);
  }

  console.log('');
  console.log(`💾 Choice saved to: postman/user-choice.json`);
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
