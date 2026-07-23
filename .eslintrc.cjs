module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  settings: { react: { version: '18.3' } },
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '.eslintrc.cjs',
    // Angular sources retained until the final cleanup PR
    'src/app',
    'src/environments',
    'src/main.ts',
    'src/polyfills.ts',
    'src/test.ts',
    'e2e',
    'karma.conf.js',
  ],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
