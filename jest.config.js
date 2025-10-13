const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  // Use jsdom for React component testing (simulates browser environment)
  // For pure utility function tests that don't need DOM, you can add
  // `@jest-environment node` comment at the top of individual test files
  testEnvironment: 'jsdom',
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
