/* eslint-env node */
module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    plugins: ['@typescript-eslint', 'react-refresh'],
    ignorePatterns: [
        'dist',
        'dev-dist',
        'node_modules',
        'playwright-report',
        'test-results',
        '.eslintrc.cjs',
        'tests/visual-regression/__screenshots__',
    ],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-explicit-any': 'error',
    },
    overrides: [
        {
            files: ['tests/**/*.ts'],
            rules: {
                '@typescript-eslint/no-empty-function': 'off',
            },
        },
    ],
};
