import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

const sentryConfig = {
  disableLogger: true,
  silent: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
};

export default process.env.SENTRY_DSN ? withSentryConfig(nextConfig, sentryConfig) : nextConfig;
