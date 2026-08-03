module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', 'coverage', 'playwright-report', 'test-results', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    plugins: ['react-refresh'],
    settings: { react: { version: 'detect' } },
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-explicit-any': 'error',
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.test.tsx', 'src/setupTests.ts', 'e2e/**/*.ts'],
            rules: { 'react-refresh/only-export-components': 'off' },
        },
    ],
};
