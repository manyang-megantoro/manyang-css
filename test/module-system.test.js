/**
 * Module System Tests
 * Tests that module system works correctly and validates module structure
 */

const fs = require('fs');
const path = require('path');

describe('Module System Tests', () => {
  const moduleDir = path.join(__dirname, '../module');
  const exampleModulePath = path.join(moduleDir, 'example-module');

  test('module directory structure is correct', () => {
    if (!fs.existsSync(moduleDir)) {
      // Skip if no modules exist yet
      return;
    }

    const modules = fs.readdirSync(moduleDir).filter(item => 
      fs.statSync(path.join(moduleDir, item)).isDirectory()
    );

    modules.forEach(moduleName => {
      const modulePath = path.join(moduleDir, moduleName);
      
      // Each module should have these required files
      expect(fs.existsSync(path.join(modulePath, 'effect-map.json'))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, 'scss'))).toBe(true);
      expect(fs.existsSync(path.join(modulePath, 'docs'))).toBe(true);
    });
  });

  test('effect-map.json files have valid structure', () => {
    if (!fs.existsSync(moduleDir)) {
      return;
    }

    const modules = fs.readdirSync(moduleDir).filter(item => 
      fs.statSync(path.join(moduleDir, item)).isDirectory()
    );

    modules.forEach(moduleName => {
      const effectMapPath = path.join(moduleDir, moduleName, 'effect-map.json');
      
      if (fs.existsSync(effectMapPath)) {
        const effectMapContent = fs.readFileSync(effectMapPath, 'utf8');
        
        expect(() => {
          JSON.parse(effectMapContent);
        }).not.toThrow();

        const effectMap = JSON.parse(effectMapContent);
        
        // Should have relation object
        expect(effectMap).toHaveProperty('relation');
        
        // Each relation should have prefix and list
        Object.keys(effectMap.relation).forEach(trigger => {
          expect(effectMap.relation[trigger]).toHaveProperty('prefix');
          expect(effectMap.relation[trigger]).toHaveProperty('list');
          expect(Array.isArray(effectMap.relation[trigger].list)).toBe(true);
        });
      }
    });
  });

  test('module SCSS files are valid', () => {
    if (!fs.existsSync(moduleDir)) {
      return;
    }

    const modules = fs.readdirSync(moduleDir).filter(item => 
      fs.statSync(path.join(moduleDir, item)).isDirectory()
    );

    modules.forEach(moduleName => {
      const scssDir = path.join(moduleDir, moduleName, 'scss');
      
      if (fs.existsSync(scssDir)) {
        const scssFiles = fs.readdirSync(scssDir).filter(file => 
          file.endsWith('.scss')
        );
        
        scssFiles.forEach(scssFile => {
          const scssPath = path.join(scssDir, scssFile);
          const scssContent = fs.readFileSync(scssPath, 'utf8');
          
          // Basic SCSS syntax validation
          expect(scssContent).not.toContain('{{'); // No template placeholders
          expect(scssContent.split('{').length).toBe(scssContent.split('}').length); // Balanced braces
        });
      }
    });
  });

  test('module documentation exists and is complete', () => {
    if (!fs.existsSync(moduleDir)) {
      return;
    }

    const modules = fs.readdirSync(moduleDir).filter(item => 
      fs.statSync(path.join(moduleDir, item)).isDirectory()
    );

    modules.forEach(moduleName => {
      const docsDir = path.join(moduleDir, moduleName, 'docs');
      
      if (fs.existsSync(docsDir)) {
        // Should have at least README.md
        expect(fs.existsSync(path.join(docsDir, 'README.md'))).toBe(true);
        
        const readmePath = path.join(docsDir, 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // README should contain module name
        expect(readmeContent.toLowerCase()).toContain(moduleName.toLowerCase());
      }
    });
  });

  test('no naming conflicts between modules', () => {
    if (!fs.existsSync(moduleDir)) {
      return;
    }

    const allClasses = [];
    const modules = fs.readdirSync(moduleDir).filter(item => 
      fs.statSync(path.join(moduleDir, item)).isDirectory()
    );

    modules.forEach(moduleName => {
      const effectMapPath = path.join(moduleDir, moduleName, 'effect-map.json');
      
      if (fs.existsSync(effectMapPath)) {
        const effectMap = JSON.parse(fs.readFileSync(effectMapPath, 'utf8'));
        
        Object.keys(effectMap.relation).forEach(trigger => {
          const prefix = effectMap.relation[trigger].prefix;
          const effects = effectMap.relation[trigger].list;
          
          effects.forEach(effect => {
            const className = `${prefix}${effect.name}`;
            allClasses.push({
              className,
              module: moduleName,
              trigger
            });
          });
        });
      }
    });

    // Check for duplicates
    const classNames = allClasses.map(item => item.className);
    const duplicates = classNames.filter((className, index) => 
      classNames.indexOf(className) !== index
    );

    if (duplicates.length > 0) {
      console.warn('Duplicate class names found:', duplicates);
    }

    expect(duplicates).toHaveLength(0);
  });

  test('example module exists and is valid template', () => {
    if (!fs.existsSync(exampleModulePath)) {
      console.warn('Example module not found - skipping template validation');
      return;
    }

    // Example module should serve as template
    expect(fs.existsSync(path.join(exampleModulePath, 'effect-map.json'))).toBe(true);
    expect(fs.existsSync(path.join(exampleModulePath, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(exampleModulePath, 'scss'))).toBe(true);
    expect(fs.existsSync(path.join(exampleModulePath, 'docs'))).toBe(true);

    // Check that example module has valid effect-map
    const effectMapPath = path.join(exampleModulePath, 'effect-map.json');
    const effectMap = JSON.parse(fs.readFileSync(effectMapPath, 'utf8'));
    
    expect(effectMap).toHaveProperty('relation');
    
    // Should have at least one trigger type
    const triggers = Object.keys(effectMap.relation);
    expect(triggers.length).toBeGreaterThan(0);
  });
});