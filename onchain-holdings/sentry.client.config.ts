import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1"),
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || "0"),
    environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  });
}
