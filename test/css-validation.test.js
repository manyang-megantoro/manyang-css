// CSS validation tests using Jest and PostCSS
const fs = require('fs');
const path = require('path');
const CSSValidator = require('./css-validator');

describe('CSS Validation Tests', () => {
  let cssValidator;
  const baseDir = path.join(__dirname, '..');
  const cssFilePath = path.join(baseDir, 'dist/manyang.css');

  beforeAll(() => {
    cssValidator = new CSSValidator();
    
    // Ensure CSS file exists
    if (!fs.existsSync(cssFilePath)) {
      throw new Error('CSS file not found. Please run "npm run build" first.');
    }
  });

  test('CSS file exists and is readable', () => {
    expect(fs.existsSync(cssFilePath)).toBe(true);
    
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    expect(cssContent).toBeTruthy();
    expect(cssContent.length).toBeGreaterThan(0);
  });

  test('CSS has valid syntax', async () => {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const validationResult = await cssValidator.validateCSS(cssContent);
    
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toHaveLength(0);
  });

  test('CSS contains manyang-prefixed classes', async () => {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const classes = await cssValidator.extractClasses(cssContent);
    
    const manyangClasses = classes.filter(cls => cls.startsWith('manyang-'));
    expect(manyangClasses.length).toBeGreaterThan(0);
    
    console.log(`Found ${manyangClasses.length} manyang-prefixed classes`);
  });

  test('CSS contains hover effect classes', async () => {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const classes = await cssValidator.extractClasses(cssContent);
    
    // Check for common hover effects
    const hoverEffects = ['fade', 'zoom', 'rotate'];
    const foundEffects = hoverEffects.filter(effect => 
      classes.some(cls => cls.includes(effect))
    );
    
    expect(foundEffects.length).toBeGreaterThan(0);
    console.log('Found hover effects:', foundEffects);
  });

  test('CSS has required animation properties', async () => {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const hasAnimationProps = await cssValidator.hasAnimationProperties(cssContent);
    
    expect(hasAnimationProps.hasTransition).toBe(true);
    expect(hasAnimationProps.hasTransform).toBe(true);
  });

  test('CSS follows manyang naming convention', async () => {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const validationResult = await cssValidator.validateNamingConvention(cssContent);
    
    expect(validationResult.isValid).toBe(true);
    
    if (validationResult.warnings.length > 0) {
      console.log('Naming warnings:', validationResult.warnings);
    }
  });

  test('CSS has reasonable file size', () => {
    const stats = fs.statSync(cssFilePath);
    const fileSizeInKB = stats.size / 1024;
    
    // CSS should be reasonably sized (less than 100KB)
    expect(fileSizeInKB).toBeLessThan(100);
    
    console.log(`Generated CSS file size: ${fileSizeInKB.toFixed(2)}KB`);
  });
});