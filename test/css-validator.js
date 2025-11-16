// Modern CSS validation using PostCSS parser
const postcss = require('postcss');
const fs = require('fs');
const path = require('path');

class CSSValidator {
  async validateCSS(cssContent) {
    try {
      const root = postcss.parse(cssContent);
      const errors = [];
      const warnings = [];

      root.walkRules(rule => {
        // Check for valid selectors
        if (!rule.selector || rule.selector.trim() === '') {
          errors.push('Empty selector found');
        }
      });

      root.walkDecls(decl => {
        // Check for invalid properties
        if (!decl.prop || decl.prop.trim() === '') {
          errors.push('Empty property found');
        }

        // Check for invalid values
        if (!decl.value || decl.value.trim() === '') {
          errors.push(`Empty value for property: ${decl.prop}`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        ruleCount: root.nodes.filter(node => node.type === 'rule').length
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Parse error: ${error.message}`],
        warnings: [],
        ruleCount: 0
      };
    }
  }

  async extractClasses(cssContent) {
    try {
      const root = postcss.parse(cssContent);
      const classes = [];

      root.walkRules(rule => {
        // Extract class selectors from the rule
        const selectors = rule.selector.split(',');
        selectors.forEach(selector => {
          const classMatches = selector.match(/\.([a-zA-Z0-9_-]+)/g);
          if (classMatches) {
            classMatches.forEach(match => {
              const className = match.substring(1); // Remove the dot
              if (!classes.includes(className)) {
                classes.push(className);
              }
            });
          }
        });
      });

      return classes;
    } catch (error) {
      throw new Error(`Failed to extract classes: ${error.message}`);
    }
  }

  async hasAnimationProperties(cssContent) {
    try {
      const root = postcss.parse(cssContent);
      let hasTransition = false;
      let hasTransform = false;
      let hasAnimation = false;

      root.walkDecls(decl => {
        if (decl.prop.includes('transition')) {
          hasTransition = true;
        }
        if (decl.prop.includes('transform')) {
          hasTransform = true;
        }
        if (decl.prop.includes('animation')) {
          hasAnimation = true;
        }
      });

      return {
        hasTransition,
        hasTransform,
        hasAnimation
      };
    } catch (error) {
      throw new Error(`Failed to check animation properties: ${error.message}`);
    }
  }

  async validateNamingConvention(cssContent) {
    try {
      const root = postcss.parse(cssContent);
      const errors = [];
      const warnings = [];

      root.walkRules(rule => {
        // Check for manyang prefix in class selectors
        const classSelectors = rule.selector.match(/\.([a-zA-Z0-9_-]+)/g);
        if (classSelectors) {
          classSelectors.forEach(selector => {
            const className = selector.substring(1);
            if (!className.startsWith('manyang-')) {
              warnings.push(`Class without manyang- prefix: ${className}`);
            }
          });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: []
      };
    }
  }

  async validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSS file not found: ${filePath}`);
    }

    const cssContent = fs.readFileSync(filePath, 'utf8');
    return await this.validateCSS(cssContent);
  }
}

module.exports = CSSValidator;