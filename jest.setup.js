/**
 * Jest Setup File
 *
 * Runs before each test file. Configures testing-library matchers.
 */

// Extend Jest matchers with testing-library assertions
import '@testing-library/jest-dom';

// Mock next/navigation (required for App Router components)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Suppress console errors during tests (optional - remove if you want to see them)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (/Warning.*not wrapped in act/.test(args[0])) return;
//     originalError.call(console, ...args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });
