module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: true },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-hooks'],
    ignorePatterns: ['dist', 'node_modules', 'dev-dist', 'coverage', 'playwright-report', '.eslintrc.cjs'],
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
    },
};
