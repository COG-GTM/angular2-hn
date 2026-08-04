module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        // Matches the Angular project's tslint conventions.
        quotes: ['error', 'single', { avoidEscape: true }],
        'max-len': ['error', { code: 140, ignoreUrls: true }],
        'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
        '@typescript-eslint/no-non-null-assertion': 'error',
    },
};
