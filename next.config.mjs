import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Sentry configuration options
const sentryConfig = {
  // Suppress source map upload messages during build
  silent: true,

  // Upload larger source maps for better stack traces
  widenClientFileUpload: true,

  // Disable Sentry telemetry
  disableLogger: true,

  // Automatically tree-shake Sentry logger
  hideSourceMaps: true,

  // Skip source map upload if no auth token (local dev)
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default withSentryConfig(bundleAnalyzer(nextConfig), sentryConfig);
