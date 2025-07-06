import { TooltipProvider } from "@radix-ui/react-tooltip";
import * as Sentry from "@sentry/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import fallbackRender from "./components/error-render";
import { I18nProvider } from "./i18n";
import Router from "./router";

export default function App() {
  return (
    <React.StrictMode>
      <ErrorBoundary
        fallbackRender={fallbackRender}
        onError={(error, componentStack) => {
          if (import.meta.env.VITE_SENTRY_DSN) {
            Sentry.captureException(error, {
              extra: { componentStack },
            });
          }
        }}
        // onReset={(details) => {
        //   // Reset the state of your app so the error doesn't happen again
        // }}
      >
        <HelmetProvider>
          <NuqsAdapter>
            <I18nProvider>
              <TooltipProvider>
                <Router />
              </TooltipProvider>
            </I18nProvider>
          </NuqsAdapter>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
