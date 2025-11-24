"use client";

import { useEffect } from "react";

export default function SentryInit() {
  useEffect(() => {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    // Only initialize if DSN is provided and not a placeholder
    if (
      typeof window !== "undefined" &&
      sentryDsn &&
      sentryDsn !== "your_sentry_dsn_here" &&
      sentryDsn.startsWith("http")
    ) {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.init({
          dsn: sentryDsn,
          tracesSampleRate: 1.0,
          environment: process.env.NODE_ENV,
        });

        window.Sentry = Sentry;
      });
    }
  }, []);

  return null;
}
