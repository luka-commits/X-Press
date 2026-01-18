/**
 * Jest Configuration for XOS Dashboard
 *
 * Uses Next.js Jest helper for proper configuration with App Router.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Test environment for React components
  testEnvironment: 'jest-environment-jsdom',

  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module path aliases matching tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test file patterns
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
  ],

  // Coverage thresholds - CI will fail if coverage drops below these
  // Starting with low thresholds based on current coverage, to be increased as more tests are added
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },

  // Coverage reporters for CI and local
  coverageReporters: ['text', 'lcov', 'json-summary'],

  // Ignore patterns - exclude test utilities and fixtures from test discovery
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/src/__tests__/utils/',
    '<rootDir>/src/__tests__/fixtures/',
  ],
};

// createJestConfig returns a Promise, so this exports the config async
module.exports = createJestConfig(customJestConfig);
