module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', 'dev-dist', '.eslintrc.cjs', 'coverage', 'playwright-report', 'test-results'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-explicit-any': 'error',
    },
    overrides: [
        {
            files: ['e2e/**/*.ts', 'playwright.config.ts'],
            rules: {
                'react-refresh/only-export-components': 'off',
            },
        },
        {
            files: ['src/context/**/*.tsx', 'src/test/**/*.tsx', 'src/routes.tsx', '**/*.test.{ts,tsx}'],
            rules: {
                'react-refresh/only-export-components': 'off',
            },
        },
    ],
};
