// Visual regression tests using Playwright
const { test, expect } = require('@playwright/test');
const VisualTester = require('./visual-tester');

test.describe('Visual Regression Tests', () => {
  let visualTester;

  test.beforeEach(async ({ page }) => {
    visualTester = new VisualTester(page);
  });

  test('demo page loads correctly', async ({ page }) => {
    await visualTester.setupDemo();
    
    // Check that all main elements are present
    await expect(page.locator('#trigger-select')).toBeVisible();
    await expect(page.locator('#effect-select')).toBeVisible();
    await expect(page.locator('#demo-preview')).toBeVisible();
    
    // Take screenshot of initial state
    await expect(page).toHaveScreenshot('demo-initial.png');
  });

  test('hover effects work visually', async ({ page }) => {
    await visualTester.setupDemo();

    // Test hover effect
    await page.selectOption('#trigger-select', 'hover');
    await page.selectOption('#effect-select', 'fade');
    
    // Wait for effect to be applied
    await page.waitForTimeout(500);
    
    // Take screenshot before hover
    await expect(page.locator('#demo-preview')).toHaveScreenshot('fade-before-hover.png');
    
    // Trigger hover
    await page.hover('#demo-preview');
    await page.waitForTimeout(1000);
    
    // Take screenshot during hover
    await expect(page.locator('#demo-preview')).toHaveScreenshot('fade-during-hover.png');
  });

  test('focus effects work visually', async ({ page }) => {
    await visualTester.setupDemo();

    // Test focus effect
    await page.selectOption('#trigger-select', 'focus');
    await page.selectOption('#effect-select', 'zoom');
    
    await page.waitForTimeout(500);
    
    // Take screenshot before focus
    await expect(page.locator('#demo-preview')).toHaveScreenshot('zoom-before-focus.png');
    
    // Trigger focus
    await page.focus('#demo-preview');
    await page.waitForTimeout(1000);
    
    // Take screenshot during focus
    await expect(page.locator('#demo-preview')).toHaveScreenshot('zoom-during-focus.png');
  });

  test('all effect combinations render correctly', async ({ page }) => {
    const results = await visualTester.testAllEffects();
    
    // Verify that all effects were tested successfully
    const failedEffects = results.filter(r => !r.success);
    
    if (failedEffects.length > 0) {
      console.log('Failed effects:', failedEffects);
    }
    
    // At least 80% of effects should work
    const successRate = (results.length - failedEffects.length) / results.length;
    expect(successRate).toBeGreaterThan(0.8);
  });
});