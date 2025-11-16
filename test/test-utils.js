/**
 * Test Utilities
 * Helper functions for testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Ensure project is built before tests
 */
function ensureBuild() {
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

/**
 * Clean up test artifacts
 */
function cleanTestArtifacts() {
  const testOutputDir = path.join(__dirname, '../test-output');
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true, force: true });
  }
}

/**
 * Validate JSON structure
 */
function validateJSON(filePath, schema) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: 'File does not exist' };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Basic schema validation
    if (schema) {
      for (const [key, type] of Object.entries(schema)) {
        if (!(key in data)) {
          return { valid: false, error: `Missing required property: ${key}` };
        }
        
        if (typeof data[key] !== type) {
          return { valid: false, error: `Property ${key} should be ${type}` };
        }
      }
    }
    
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Check if CSS file is valid
 */
function validateCSS(cssPath) {
  if (!fs.existsSync(cssPath)) {
    return { valid: false, error: 'CSS file does not exist' };
  }

  try {
    const { parse } = require('css-tree');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    parse(cssContent);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Get all CSS class names from file
 */
function extractCSSClasses(cssPath) {
  if (!fs.existsSync(cssPath)) {
    return [];
  }

  try {
    const { parse, walk } = require('css-tree');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const ast = parse(cssContent);
    
    const classes = [];
    walk(ast, (node) => {
      if (node.type === 'ClassSelector') {
        classes.push(node.name);
      }
    });
    
    return [...new Set(classes)]; // Remove duplicates
  } catch (error) {
    console.error('Error extracting CSS classes:', error);
    return [];
  }
}

/**
 * Check if all required files exist for a module
 */
function validateModuleStructure(modulePath) {
  const requiredFiles = [
    'effect-map.json',
    'README.md',
    'scss',
    'docs'
  ];

  const requiredDocs = [
    'docs/README.md'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(modulePath, file))) {
      return { valid: false, missing: file };
    }
  }

  for (const file of requiredDocs) {
    if (!fs.existsSync(path.join(modulePath, file))) {
      return { valid: false, missing: file };
    }
  }

  return { valid: true };
}

/**
 * Generate test report
 */
function generateTestReport(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.length,
      passed: testResults.filter(t => t.status === 'passed').length,
      failed: testResults.filter(t => t.status === 'failed').length,
      skipped: testResults.filter(t => t.status === 'skipped').length
    },
    results: testResults
  };

  const reportPath = path.join(__dirname, '../test-output/test-report.json');
  
  // Ensure directory exists
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Performance testing helper
 */
function measureBuildTime() {
  const start = Date.now();
  
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    
    const duration = Date.now() - start;
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - start;
    return { success: false, duration, error: error.message };
  }
}

module.exports = {
  ensureBuild,
  cleanTestArtifacts,
  validateJSON,
  validateCSS,
  extractCSSClasses,
  validateModuleStructure,
  generateTestReport,
  measureBuildTime
};