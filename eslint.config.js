import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist',
            'dev-dist',
            'coverage',
            'node_modules',
            'playwright-report',
            'test-results',
            'src/app',
            'src/environments',
            'src/main.ts',
            'src/polyfills.ts',
            'src/test.ts',
            'e2e/protractor.conf.js',
            'e2e/src',
            'karma.conf.js',
        ],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            globals: { ...globals.browser, ...globals.node },
        },
        settings: { react: { version: 'detect' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/no-danger': 'off',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    {
        files: ['src/test/**', '**/*.test.{ts,tsx}'],
        rules: { 'react-refresh/only-export-components': 'off' },
    }
);
