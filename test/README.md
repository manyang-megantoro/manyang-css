# Testing Documentation

This document outlines the comprehensive testing strategy for Manyang CSS hover effects library.

## 🧪 **Test Categories**

### 1. **Build System Tests** (`build-system.test.js`)
- ✅ Module merging functionality
- ✅ SCSS compilation process
- ✅ PostCSS transformations
- ✅ Documentation building
- ✅ Output file validation

### 2. **CSS Validation Tests** (`css-validation.test.js`)
- ✅ CSS syntax validation
- ✅ Class naming conventions (manyang- prefix)
- ✅ File size optimization
- ✅ Keyframes for animations
- ✅ Duplicate selector detection

### 3. **Module System Tests** (`module-system.test.js`)
- ✅ Module directory structure
- ✅ effect-map.json validation
- ✅ SCSS file syntax checking
- ✅ Documentation completeness
- ✅ Naming conflict detection
- ✅ Example module template validation

### 4. **Demo Interface Tests** (`demo-interface.test.js`)
- ✅ Demo file existence
- ✅ JSON structure validation
- ✅ JavaScript functionality
- ✅ HTML structure completeness
- ✅ Effect mapping accuracy

### 5. **Visual Regression Tests** (`visual-regression.test.js`)
- ✅ Demo page loading
- ✅ Wizard navigation flow
- ✅ CSS effect application
- ✅ Hover interaction testing
- ✅ JavaScript error detection

### 6. **Performance Tests** (`performance.test.js`)
- ✅ Build time optimization
- ✅ CSS file size limits
- ✅ Module merging efficiency
- ✅ Documentation build speed
- ✅ Memory leak detection

## 🚀 **Running Tests**

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm run test:build    # Build system tests only
npm run test:css      # CSS validation only
npm run test:visual   # Visual regression tests only
```

### Advanced Testing

```bash
# Run performance tests
npx jest --testMatch="**/performance.test.js"

# Run module system tests
npx jest --testMatch="**/module-system.test.js"

# Run with verbose output
npx jest --verbose

# Run specific test file
npx jest test/build-system.test.js
```

## 📊 **Test Coverage**

The test suite covers:

- **Build Scripts**: All automation scripts in `/scripts/`
- **Demo Logic**: JavaScript functionality in `/demo/`
- **Module Validation**: Structure and content validation
- **CSS Output**: Generated CSS validation and optimization
- **Performance**: Build times and resource usage

Coverage reports are generated in `test-output/coverage/`

## 🔧 **Test Dependencies**

The following packages are required for testing:

```json
{
  "jest": "^29.7.0",           // Testing framework
  "css-tree": "^2.3.1",       // CSS parsing and validation
  "puppeteer": "^21.6.1"      // Browser automation for visual tests
}
```

## 🎯 **Test Configuration**

### Jest Configuration

```json
{
  "testEnvironment": "node",
  "setupFilesAfterEnv": ["<rootDir>/test/setup.js"],
  "testMatch": ["**/test/**/*.test.js"],
  "collectCoverageFrom": [
    "scripts/**/*.js",
    "demo/**/*.js"
  ]
}
```

### Custom Matchers

The test suite includes custom Jest matchers:

- `toBeValidCSS()`: Validates CSS syntax
- `toHaveValidModuleStructure()`: Validates module directory structure
- `toContainManyangClasses()`: Ensures proper class prefixing

## 📝 **Test Structure**

```
test/
├── setup.js                    # Global test configuration
├── test-utils.js              # Helper functions
├── build-system.test.js       # Build process validation
├── css-validation.test.js     # CSS output validation
├── module-system.test.js      # Module structure validation
├── demo-interface.test.js     # Demo functionality testing
├── visual-regression.test.js  # Browser-based testing
└── performance.test.js        # Performance benchmarks
```

## 🚨 **Continuous Integration**

For CI/CD environments, use:

```bash
# Install dependencies (including dev dependencies)
npm ci

# Run full test suite
npm run test:coverage

# Build project to ensure everything works
npm run build
```

## 🐛 **Debugging Tests**

### Common Issues

1. **Build failures**: Ensure all dependencies are installed
   ```bash
   npm install
   npm run build
   ```

2. **Puppeteer issues**: Visual tests require Chromium
   ```bash
   # Install Puppeteer dependencies on Linux
   sudo apt-get install chromium-browser
   ```

3. **CSS-tree errors**: Ensure CSS syntax is valid
   ```bash
   # Run CSS validation standalone
   npm run test:css
   ```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run single test with verbose logging
npx jest --verbose --no-cache test/build-system.test.js
```

## 📈 **Adding New Tests**

### For New Modules

1. Add module structure validation to `module-system.test.js`
2. Update effect mapping tests in `demo-interface.test.js`
3. Add performance benchmarks if needed

### For New Build Features

1. Add build validation to `build-system.test.js`
2. Update CSS validation rules as needed
3. Add performance metrics if applicable

### For New Demo Features

1. Update `demo-interface.test.js` for new UI elements
2. Add visual regression tests for new interactions
3. Update documentation build tests if docs are affected

## 📚 **Best Practices**

1. **Always run tests before committing**
2. **Add tests for new features**
3. **Update tests when changing functionality**
4. **Use descriptive test names**
5. **Keep tests isolated and independent**
6. **Mock external dependencies when needed**

## 🏆 **Quality Gates**

Before releasing:

- [ ] All tests passing
- [ ] Coverage > 80%
- [ ] Build time < 10 seconds
- [ ] CSS file < 100KB
- [ ] No JavaScript errors in demo
- [ ] All modules have valid structure