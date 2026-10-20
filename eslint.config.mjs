import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Angular sources (src/, e2e/) are linted by `npm run ng:lint` until Phase 3 removes them.
    {
        ignores: [
            'dist',
            'dist-react',
            'coverage',
            'node_modules',
            'src',
            'e2e/**/*.js',
            'e2e/protractor.conf.js',
            'e2e/src',
            'playwright-report',
            'test-results',
        ],
    },
    {
        files: ['src-react/**/*.{ts,tsx}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    {
        files: ['src-react/**/*.test.{ts,tsx}', 'src-react/shared/test-utils/**'],
        rules: { 'react-refresh/only-export-components': 'off' },
    },
    {
        files: ['*.config.{ts,js}', 'e2e/**/*.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: { globals: globals.node },
    },
    prettier
);
