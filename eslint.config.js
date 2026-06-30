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
      // This project intentionally keeps the classic NgModule + constructor
      // injection architecture, so opt out of the standalone/inject migrations.
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-inject": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // Templates still use the classic structural directives (*ngIf/*ngFor).
      "@angular-eslint/template/prefer-control-flow": "off",
      // The existing UI relies on click handlers on non-interactive elements;
      // keyboard-accessibility hardening is tracked separately, out of scope
      // for this dependency migration.
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
    },
  },
]);
