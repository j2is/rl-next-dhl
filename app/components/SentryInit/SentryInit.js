"use client";

import { useEffect } from "react";

export default function SentryInit() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 1.0,
          environment: process.env.NODE_ENV,
        });

        window.Sentry = Sentry;
      });
    }
  }, []);

  return null;
}
