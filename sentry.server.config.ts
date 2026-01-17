import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Low sample rate for internal tool with low traffic
  tracesSampleRate: 0.5,
});
