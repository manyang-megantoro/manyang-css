// Modern visual testing using Playwright
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

class VisualTester {
  constructor(page) {
    this.page = page;
  }

  async setupDemo() {
    // Navigate to demo page
    await this.page.goto('file://' + path.join(__dirname, '../demo/index.html'));
    await this.page.waitForLoadState('networkidle');
  }

  async testEffect(trigger, effect, model) {
    await this.setupDemo();

    // Select trigger
    await this.page.selectOption('#trigger-select', trigger);
    await this.page.waitForTimeout(500);

    // Select effect
    await this.page.selectOption('#effect-select', effect);
    await this.page.waitForTimeout(500);

    // Select model if available
    const modelOptions = await this.page.locator('#model-select option').count();
    if (modelOptions > 1) {
      await this.page.selectOption('#model-select', model);
      await this.page.waitForTimeout(500);
    }

    // Wait for preview to render
    await this.page.waitForSelector('#demo-preview', { state: 'visible' });

    // Take screenshot of initial state
    const initialScreenshot = await this.page.locator('#demo-preview').screenshot();

    // Trigger hover/interaction
    await this.page.hover('#demo-preview');
    await this.page.waitForTimeout(1000); // Wait for animation

    // Take screenshot of animated state
    const animatedScreenshot = await this.page.locator('#demo-preview').screenshot();

    return {
      initial: initialScreenshot,
      animated: animatedScreenshot,
      effect: `${trigger}-${effect}-${model}`
    };
  }

  async testAllEffects() {
    const results = [];
    
    // Load effect map
    const effectMapPath = path.join(__dirname, '../demo/effect-map.json');
    const effectMap = JSON.parse(fs.readFileSync(effectMapPath, 'utf8'));

    for (const [trigger, triggerData] of Object.entries(effectMap.relation)) {
      for (const [effect, models] of Object.entries(triggerData.list)) {
        const modelList = Array.isArray(models) ? models : models.models || [];
        
        for (const model of modelList) {
          try {
            const result = await this.testEffect(trigger, effect, model);
            results.push({
              ...result,
              success: true,
              error: null
            });
          } catch (error) {
            results.push({
              effect: `${trigger}-${effect}-${model}`,
              success: false,
              error: error.message
            });
          }
        }
      }
    }

    return results;
  }
}

module.exports = VisualTester;