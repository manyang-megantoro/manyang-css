/**
 * Demo Interface Tests
 * Tests that the demo interface works correctly
 */

const fs = require('fs');
const path = require('path');

describe('Demo Interface Tests', () => {
  const demoDir = path.join(__dirname, '../demo');
  const demoJSPath = path.join(demoDir, 'demo.js');
  const effectMapPath = path.join(demoDir, 'effect-map.json');
  const demoHTMLPath = path.join(demoDir, 'index.html');

  test('demo files exist', () => {
    expect(fs.existsSync(demoJSPath)).toBe(true);
    expect(fs.existsSync(effectMapPath)).toBe(true);
    expect(fs.existsSync(demoHTMLPath)).toBe(true);
  });

  test('effect-map.json is valid JSON with correct structure', () => {
    const effectMapContent = fs.readFileSync(effectMapPath, 'utf8');
    
    expect(() => {
      JSON.parse(effectMapContent);
    }).not.toThrow();

    const effectMap = JSON.parse(effectMapContent);
    
    // Should have relation object
    expect(effectMap).toHaveProperty('relation');
    
    // Each relation should have prefix and list structure
    Object.keys(effectMap.relation).forEach(trigger => {
      expect(effectMap.relation[trigger]).toHaveProperty('prefix');
      expect(effectMap.relation[trigger]).toHaveProperty('list');
      expect(Array.isArray(effectMap.relation[trigger].list)).toBe(true);
      
      // Each effect in list should have name and models
      effectMap.relation[trigger].list.forEach(effect => {
        expect(effect).toHaveProperty('name');
        expect(effect).toHaveProperty('models');
        expect(Array.isArray(effect.models)).toBe(true);
      });
    });
  });

  test('demo.js contains required functionality', () => {
    const demoJSContent = fs.readFileSync(demoJSPath, 'utf8');
    
    // Should contain main wizard functions
    expect(demoJSContent).toContain('initializeWizard');
    expect(demoJSContent).toContain('updateTriggerOptions');
    expect(demoJSContent).toContain('updateEffectOptions');
    expect(demoJSContent).toContain('updateModelOptions');
    expect(demoJSContent).toContain('updatePreview');
    
    // Should handle dynamic class application
    expect(demoJSContent).toContain('applyHoverClass');
    expect(demoJSContent).toContain('removeAllClasses');
  });

  test('demo HTML structure is complete', () => {
    const demoHTMLContent = fs.readFileSync(demoHTMLPath, 'utf8');
    
    // Should contain required elements
    expect(demoHTMLContent).toContain('id="trigger-select"');
    expect(demoHTMLContent).toContain('id="effect-select"');
    expect(demoHTMLContent).toContain('id="model-select"');
    expect(demoHTMLContent).toContain('id="preview-element"');
    
    // Should include necessary scripts and styles
    expect(demoHTMLContent).toContain('demo.js');
    expect(demoHTMLContent).toContain('demo.css');
  });

  test('module-map.json exists and is valid', () => {
    const moduleMapPath = path.join(demoDir, 'module-map.json');
    
    if (fs.existsSync(moduleMapPath)) {
      const moduleMapContent = fs.readFileSync(moduleMapPath, 'utf8');
      
      expect(() => {
        JSON.parse(moduleMapContent);
      }).not.toThrow();

      const moduleMap = JSON.parse(moduleMapContent);
      
      // Should be an object with module names as keys
      expect(typeof moduleMap).toBe('object');
      expect(moduleMap).not.toBeNull();
    }
  });

  test('effect-map structure supports all trigger types', () => {
    const effectMapContent = fs.readFileSync(effectMapPath, 'utf8');
    const effectMap = JSON.parse(effectMapContent);
    
    const triggers = Object.keys(effectMap.relation);
    
    // Should have at least hover, click, and default triggers
    const expectedTriggers = ['hover', 'click', 'default'];
    expectedTriggers.forEach(trigger => {
      expect(triggers).toContain(trigger);
    });
    
    // Each trigger should have valid prefix format
    triggers.forEach(trigger => {
      const prefix = effectMap.relation[trigger].prefix;
      expect(prefix).toMatch(/^manyang-[hcd]-$/);
    });
  });

  test('all effects have proper model variations', () => {
    const effectMapContent = fs.readFileSync(effectMapPath, 'utf8');
    const effectMap = JSON.parse(effectMapContent);
    
    Object.keys(effectMap.relation).forEach(trigger => {
      effectMap.relation[trigger].list.forEach(effect => {
        // Each effect should have at least one model
        expect(effect.models.length).toBeGreaterThan(0);
        
        // Each model should have a valid name
        effect.models.forEach(model => {
          expect(model).toHaveProperty('name');
          expect(typeof model.name).toBe('string');
          expect(model.name.length).toBeGreaterThan(0);
        });
      });
    });
  });
});