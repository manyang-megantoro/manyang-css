const fs = require('fs');
const path = require('path');

// Create gh-pages directory structure
const ghPagesDir = path.resolve(__dirname, '..', 'gh-pages');
const docsSourceDir = path.resolve(__dirname, '..', 'docs');
const demoSourceDir = path.resolve(__dirname, '..', 'demo');
const distSourceDir = path.resolve(__dirname, '..', 'dist');

// Clean gh-pages directory
if (fs.existsSync(ghPagesDir)) {
  fs.rmSync(ghPagesDir, { recursive: true, force: true });
}
fs.mkdirSync(ghPagesDir, { recursive: true });

// Copy demo files to root of gh-pages
console.log('Copying demo files to gh-pages root...');
copyDirectory(demoSourceDir, ghPagesDir);

// Copy dist files to gh-pages root (so demo can access them)
console.log('Copying dist files to gh-pages root...');
const distDestDir = path.join(ghPagesDir, 'dist');
fs.mkdirSync(distDestDir, { recursive: true });
copyDirectory(distSourceDir, distDestDir);

// Copy docs to gh-pages/docs
console.log('Copying docs to gh-pages/docs...');
const docsDestDir = path.join(ghPagesDir, 'docs');
copyDirectory(docsSourceDir, docsDestDir);

// Also copy the built CSS to docs folder (for docsify examples)
fs.copyFileSync(
  path.join(distSourceDir, 'manyang.css'),
  path.join(docsDestDir, 'manyang.css')
);

console.log('✅ GitHub Pages structure prepared in ./gh-pages/');
console.log('   - Demo: root (/)');
console.log('   - Docs: /docs/');

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
