const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'dist', 'manyang.css');
const destDir = path.resolve(__dirname, '..', 'docs');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, 'manyang.css'));
console.log('copied dist/manyang.css -> docs/manyang.css');