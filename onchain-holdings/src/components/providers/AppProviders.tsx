"use client";

import type { ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

if (typeof window !== "undefined" && posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: "history_change",
    capture_pageleave: true,
    loaded: (client) => {
      if (process.env.NODE_ENV === "development") {
        client.debug();
      }
    },
    person_profiles: "identified_only",
  });
}

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  if (!posthogKey) {
    return children;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
