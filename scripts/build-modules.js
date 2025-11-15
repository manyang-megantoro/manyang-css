// Build all module SCSS to dist/manyang-{module}.css and run postcss for each
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MODULES_DIR = path.join(__dirname, '../module');
const DIST_DIR = path.join(__dirname, '../dist');
const POSTCSS_CONFIG = path.join(__dirname, '../postcss.config.js');

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR);

fs.readdirSync(MODULES_DIR).forEach(mod => {
  const scssDir = path.join(MODULES_DIR, mod, 'scss');
  if (fs.existsSync(scssDir)) {
    fs.readdirSync(scssDir).forEach(file => {
      if (file.startsWith('manyang-') && file.endsWith('.scss')) {
        const scssPath = path.join(scssDir, file);
        const cssName = file.replace(/\.scss$/, '.css');
        const cssPath = path.join(DIST_DIR, cssName);
        const postcssPath = path.join(DIST_DIR, cssName.replace(/\.css$/, '.post.css'));
        // Compile SCSS to CSS
        execSync(`npx sass ${scssPath} ${cssPath} --no-source-map`);
        // Run PostCSS
        execSync(`npx postcss ${cssPath} --config ${POSTCSS_CONFIG} -o ${cssPath}`);
        console.log(`Built ${cssPath}`);
      }
    });
  }
});
