module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/selenium-tests/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'selenium-tests/tsconfig.json'
    }]
  },
  testTimeout: 30000,
  verbose: true
};
