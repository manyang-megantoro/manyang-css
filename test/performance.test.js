// Performance tests using Playwright
const { test, expect } = require('@playwright/test');
const PerformanceTester = require('./performance-tester');

test.describe('Performance Tests', () => {
  let performanceTester;

  test.beforeEach(async ({ page }) => {
    performanceTester = new PerformanceTester(page);
  });

  test('CSS files load within acceptable time', async ({ page }) => {
    const loadMetrics = await performanceTester.measureCSSLoadTime();
    
    // Assert that CSS loads quickly
    const totalLoadTime = loadMetrics.cssFiles.reduce((sum, file) => sum + file.loadTime, 0);
    expect(totalLoadTime).toBeLessThan(1000); // Less than 1 second
    
    console.log('CSS Load Metrics:', loadMetrics);
  });

  test('memory usage is within limits', async ({ page }) => {
    await performanceTester.setupDemo();
    
    const memoryInfo = await performanceTester.measureMemoryUsage();
    
    if (memoryInfo) {
      const memoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
      expect(memoryMB).toBeLessThan(50); // Less than 50MB
      
      console.log(`Memory usage: ${memoryMB.toFixed(2)}MB`);
    } else {
      console.log('Memory measurement not supported in this browser');
    }
  });

  test('animations perform smoothly', async ({ page }) => {
    const animationMetrics = await performanceTester.measureAnimationPerformance('hover', 'fade', 'in');
    
    // Assert animation performance
    expect(animationMetrics.fps).toBeGreaterThan(30); // At least 30 FPS
    expect(animationMetrics.duration).toBeLessThan(2000); // Animation completes within 2 seconds
    
    console.log('Animation Performance:', animationMetrics);
  });

  test('comprehensive performance audit', async ({ page }) => {
    const auditResults = await performanceTester.runPerformanceAudit();
    const assertions = performanceTester.assertPerformanceMetrics(auditResults);
    
    // Log performance results
    console.log('Performance Audit Results:');
    console.log('CSS Load Time:', auditResults.cssLoadTime);
    console.log('Memory Usage:', auditResults.memoryUsage);
    console.log('Tested Animations:', auditResults.animations.length);
    
    // Check assertions
    console.log('Performance Assertions:');
    assertions.forEach(assertion => {
      console.log(`${assertion.test}: ${assertion.passed ? '✅' : '❌'} ${assertion.value} (${assertion.threshold})`);
      expect(assertion.passed).toBe(true);
    });
    
    // At least 80% of animations should be successful
    const successfulAnimations = auditResults.animations.filter(a => a.success).length;
    const successRate = successfulAnimations / auditResults.animations.length;
    expect(successRate).toBeGreaterThan(0.8);
  });
});