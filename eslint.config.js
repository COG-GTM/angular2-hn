// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Standalone components, inject(), and control flow migrations are
      // handled in a separate modernization wave.
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-inject": "off",
      "@angular-eslint/no-empty-lifecycle-method": "off",
      "@typescript-eslint/no-empty-function": [
        "error",
        { allow: ["constructors"] },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // Template control flow and accessibility fixes are handled in a
      // separate styling/template wave.
      "@angular-eslint/template/prefer-control-flow": "off",
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
    },
  }
]);
