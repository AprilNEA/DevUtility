/**
 * Copyright (c) 2023-2025, ApriilNEA LLC.
 *
 * Dual licensed under:
 * - GPL-3.0 (open source)
 * - Commercial license (contact us)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for details or contact admin@aprilnea.com
 */

import { TooltipProvider } from "@radix-ui/react-tooltip";
import * as Sentry from "@sentry/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import fallbackRender from "./components/error-render";
import { I18nProvider } from "./i18n";
import App from "./router";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
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
      <NuqsAdapter>
        <I18nProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </I18nProvider>
      </NuqsAdapter>
    </ErrorBoundary>
  </React.StrictMode>,
);
