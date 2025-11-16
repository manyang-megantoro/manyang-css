/**
 * Jest Test Configuration
 * Custom setup for testing environment
 */

const { ensureBuild } = require('./test-utils');

// Global setup - run before all tests
beforeAll(async () => {
  console.log('🔧 Setting up test environment...');
  
  // Ensure project is built before running tests
  const buildSuccess = ensureBuild();
  if (!buildSuccess) {
    console.error('❌ Build failed - some tests may fail');
  } else {
    console.log('✅ Build completed successfully');
  }
}, 30000); // 30 second timeout for build

// Global teardown
afterAll(() => {
  console.log('🧹 Cleaning up test environment...');
});

// Custom matchers
expect.extend({
  toBeValidCSS(received) {
    const { validateCSS } = require('./test-utils');
    const result = validateCSS(received);
    
    if (result.valid) {
      return {
        message: () => `Expected ${received} not to be valid CSS`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be valid CSS, but got error: ${result.error}`,
        pass: false
      };
    }
  },

  toHaveValidModuleStructure(received) {
    const { validateModuleStructure } = require('./test-utils');
    const result = validateModuleStructure(received);
    
    if (result.valid) {
      return {
        message: () => `Expected ${received} not to have valid module structure`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to have valid module structure, but missing: ${result.missing}`,
        pass: false
      };
    }
  },

  toContainManyangClasses(received) {
    const { extractCSSClasses } = require('./test-utils');
    const classes = extractCSSClasses(received);
    const manyangClasses = classes.filter(cls => cls.startsWith('manyang-'));
    
    if (manyangClasses.length > 0) {
      return {
        message: () => `Expected ${received} not to contain manyang classes`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to contain manyang classes, found classes: ${classes.join(', ')}`,
        pass: false
      };
    }
  }
});

// Console override for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out common warnings that don't affect functionality
  const message = args.join(' ');
  
  if (
    message.includes('Puppeteer not available') ||
    message.includes('css-tree') ||
    message.includes('PostCSS plugin')
  ) {
    // Suppress these specific warnings during tests
    return;
  }
  
  originalConsoleError.apply(console, args);
};