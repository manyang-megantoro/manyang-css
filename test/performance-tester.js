// Modern performance testing using Web Performance APIs
const { test, expect } = require('@playwright/test');
const path = require('path');

class PerformanceTester {
  constructor(page) {
    this.page = page;
  }

  async setupDemo() {
    await this.page.goto('file://' + path.join(__dirname, '../demo/index.html'));
    await this.page.waitForLoadState('networkidle');
  }

  async measureCSSLoadTime() {
    const startTime = Date.now();
    
    // Use performance API to measure CSS load times
    const metrics = await this.page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.css'));
      
      return perfEntries.map(entry => ({
        name: entry.name,
        loadTime: entry.loadEnd - entry.loadStart,
        transferSize: entry.transferSize,
        decodedBodySize: entry.decodedBodySize
      }));
    });

    return {
      cssFiles: metrics,
      totalTime: Date.now() - startTime
    };
  }

  async measureAnimationPerformance(trigger, effect, model) {
    await this.setupDemo();

    // Setup effect
    await this.page.selectOption('#trigger-select', trigger);
    await this.page.selectOption('#effect-select', effect);
    
    const modelOptions = await this.page.locator('#model-select option').count();
    if (modelOptions > 1) {
      await this.page.selectOption('#model-select', model);
    }

    await this.page.waitForTimeout(500);

    // Measure animation performance
    const performanceMetrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const element = document.querySelector('#demo-preview');
        const startTime = performance.now();
        let frameCount = 0;
        let animationEndTime = null;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          frameCount += entries.length;
        });
        observer.observe({ type: 'measure', buffered: true });

        // Trigger hover
        const hoverEvent = new Event('mouseenter');
        element.dispatchEvent(hoverEvent);

        // Monitor for animation completion
        const checkComplete = () => {
          const currentTime = performance.now();
          if (currentTime - startTime > 2000) { // 2 second max
            animationEndTime = currentTime;
            observer.disconnect();
            
            resolve({
              duration: animationEndTime - startTime,
              frameCount: frameCount,
              fps: frameCount / ((animationEndTime - startTime) / 1000),
              effect: `${element.className}`
            });
          } else {
            requestAnimationFrame(checkComplete);
          }
        };

        requestAnimationFrame(checkComplete);
      });
    });

    return performanceMetrics;
  }

  async measureMemoryUsage() {
    // Modern memory measurement
    const memoryInfo = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    return memoryInfo;
  }

  async runPerformanceAudit() {
    const results = {
      cssLoadTime: await this.measureCSSLoadTime(),
      memoryUsage: await this.measureMemoryUsage(),
      animations: []
    };

    // Load effect map for testing
    const effectMapPath = path.join(__dirname, '../demo/effect-map.json');
    const effectMap = require(effectMapPath);

    // Test a sample of effects for performance
    for (const [trigger, triggerData] of Object.entries(effectMap.relation)) {
      for (const [effect, models] of Object.entries(triggerData.list)) {
        const modelList = Array.isArray(models) ? models : models.models || [];
        
        // Test first model only for performance (avoid long test times)
        if (modelList.length > 0) {
          try {
            const animationPerf = await this.measureAnimationPerformance(
              trigger, 
              effect, 
              modelList[0]
            );
            results.animations.push({
              ...animationPerf,
              trigger,
              effect,
              model: modelList[0],
              success: true
            });
          } catch (error) {
            results.animations.push({
              trigger,
              effect,
              model: modelList[0],
              success: false,
              error: error.message
            });
          }
        }
      }
    }

    return results;
  }

  // Performance assertions
  assertPerformanceMetrics(results) {
    const assertions = [];

    // CSS load time should be reasonable
    const totalCSSTime = results.cssLoadTime.cssFiles
      .reduce((total, file) => total + file.loadTime, 0);
    
    assertions.push({
      test: 'CSS Load Time',
      passed: totalCSSTime < 1000, // Less than 1 second
      value: `${totalCSSTime}ms`,
      threshold: '< 1000ms'
    });

    // Animation FPS should be acceptable
    const avgFPS = results.animations
      .filter(a => a.success)
      .reduce((sum, a) => sum + (a.fps || 0), 0) / results.animations.length;
    
    assertions.push({
      test: 'Average Animation FPS',
      passed: avgFPS > 30, // At least 30 FPS
      value: `${avgFPS.toFixed(2)} FPS`,
      threshold: '> 30 FPS'
    });

    // Memory usage should be reasonable
    if (results.memoryUsage) {
      const memoryMB = results.memoryUsage.usedJSHeapSize / (1024 * 1024);
      assertions.push({
        test: 'Memory Usage',
        passed: memoryMB < 50, // Less than 50MB
        value: `${memoryMB.toFixed(2)}MB`,
        threshold: '< 50MB'
      });
    }

    return assertions;
  }
}

module.exports = PerformanceTester;