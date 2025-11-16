/**
 * Build System Tests
 * Tests that all build scripts work correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Build System Tests', () => {
  const testDir = path.join(__dirname, '../test-output');
  const moduleDir = path.join(__dirname, '../module');

  beforeAll(() => {
    // Create test output directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test output
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('merge-modules script executes without errors', () => {
    expect(() => {
      execSync('node scripts/merge-modules.js', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
    }).not.toThrow();
  });

  test('build-modules script executes without errors', () => {
    expect(() => {
      execSync('node scripts/build-modules.js', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
    }).not.toThrow();
  });

  test('build-docs script executes without errors', () => {
    expect(() => {
      execSync('node scripts/build-docs.js', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
    }).not.toThrow();
  });

  test('SCSS compilation produces valid CSS', () => {
    // Run SASS build
    execSync('npm run build:sass', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    const sassOutput = path.join(__dirname, '../dist/manyang.sass.css');
    expect(fs.existsSync(sassOutput)).toBe(true);

    const cssContent = fs.readFileSync(sassOutput, 'utf8');
    expect(cssContent).toContain('.manyang-');
    expect(cssContent.length).toBeGreaterThan(0);
  });

  test('PostCSS processing produces optimized CSS', () => {
    // Run complete build
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    const finalOutput = path.join(__dirname, '../dist/manyang.css');
    expect(fs.existsSync(finalOutput)).toBe(true);

    const cssContent = fs.readFileSync(finalOutput, 'utf8');
    expect(cssContent).toContain('.manyang-');
    
    // Check that PostCSS optimizations were applied
    expect(cssContent).not.toContain('  '); // No double spaces
  });

  test('documentation builds contain module content', () => {
    execSync('npm run build:docs', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    const sidebarPath = path.join(__dirname, '../docs/_sidebar.md');
    expect(fs.existsSync(sidebarPath)).toBe(true);

    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    
    // Check that modules are included in sidebar
    if (fs.existsSync(moduleDir)) {
      const modules = fs.readdirSync(moduleDir);
      modules.forEach(moduleName => {
        if (fs.statSync(path.join(moduleDir, moduleName)).isDirectory()) {
          expect(sidebarContent).toContain(moduleName);
        }
      });
    }
  });
});