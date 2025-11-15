// Script to merge all module effect-map.json into demo/module-map.json
// and to list all SCSS for build (for build tool integration)

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '../module');
const OUTPUT_JSON = path.join(__dirname, '../demo/module-map.json');
const CORE_JSON = path.join(__dirname, '../demo/effect-map.json');
const scssFiles = [];
let merged = { relation: {}, model: {} };

// Load core to get allowed triggers and their prefix
let core = {};
if (fs.existsSync(CORE_JSON)) {
  core = JSON.parse(fs.readFileSync(CORE_JSON, 'utf8'));
  merged.relation = JSON.parse(JSON.stringify(core.relation));
  merged.model = Object.assign({}, core.model);
}

fs.readdirSync(MODULES_DIR).forEach(mod => {
  const modDir = path.join(MODULES_DIR, mod);
  const effectMapPath = path.join(modDir, 'effect-map.json');
  const scssDir = path.join(modDir, 'scss');
  if (fs.existsSync(effectMapPath)) {
    const map = JSON.parse(fs.readFileSync(effectMapPath, 'utf8'));
    // Merge relation
    Object.entries(map.relation || {}).forEach(([trigger, val]) => {
      // Validation: prefix only allowed in core
      if ('prefix' in (val || {})) {
        console.warn(`[WARNING] Module ${mod} tries to set prefix for trigger '${trigger}'. Prefix can only be set in core. Ignored.`);
      }
      // Validation: trigger must exist in core
      if (!core.relation[trigger]) {
        console.warn(`[WARNING] Module ${mod} tries to add new trigger '${trigger}' which does not exist in core. Please add trigger and prefix in core first.`);
        return;
      }
      // Merge list
      Object.entries(val.list || {}).forEach(([effect, effVal]) => {
        merged.relation[trigger].list = merged.relation[trigger].list || {};
        merged.relation[trigger].list[effect] = effVal;
      });
    });
    // Merge model
    Object.assign(merged.model, map.model || {});
  }
  // Collect SCSS files
  if (fs.existsSync(scssDir)) {
    fs.readdirSync(scssDir).forEach(file => {
      if (file.endsWith('.scss')) {
        scssFiles.push(path.join(scssDir, file));
      }
    });
  }
});

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(merged, null, 2));
console.log('Merged module-map.json created.');
console.log('SCSS files for build:', scssFiles);
