import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Low sample rate for internal tool with low traffic
  tracesSampleRate: 0.5,

  // Capture 100% of errors with replays for debugging
  replaysOnErrorSampleRate: 1.0,

  // Sample 10% of sessions for general monitoring
  replaysSessionSampleRate: 0.1,
});
