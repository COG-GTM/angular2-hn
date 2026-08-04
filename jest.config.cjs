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
};
