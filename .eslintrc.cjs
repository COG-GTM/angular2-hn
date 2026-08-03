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
    // src/app holds the not-yet-ported Angular sources; each is removed as its React port lands.
    ignorePatterns: ['dist', 'coverage', 'node_modules', '.eslintrc.cjs', 'src/app'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    settings: { react: { version: 'detect' } },
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**/*.ts'],
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
    ],
};
