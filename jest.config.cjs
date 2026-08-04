/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '\\.(css|scss)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: { module: 'CommonJS', verbatimModuleSyntax: false } }],
    },
    testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/main.tsx', '!src/test-utils.tsx'],
    coverageDirectory: '<rootDir>/coverage',
};
