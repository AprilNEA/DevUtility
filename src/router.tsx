/**
 * Copyright (c) 2023-2025, AprilNEA LLC.
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

import "./index.css";

// import { lazy } from "react";
import { Route, Router, Switch } from "wouter";
import Metadata from "./components/meta";
import AppSidebar from "./components/sidebar";
import utilities, { type UtilityMeta } from "./utilities/meta";

// const SettingsPage = lazy(() => import("./pages/settings"));

const convertToRoute = (utility: UtilityMeta) => {
  if ("items" in utility) {
    // utility group
    return (
      <Route key={utility.key} path={utility.key} nest>
        {utility.items.map((item) => convertToRoute(item))}
      </Route>
    );
  } else {
    // single utility
    return (
      <Route
        key={utility.key}
        path={utility.key}
        component={(args) => (
          <>
            <Metadata title={utility.title.message} />
            <utility.page {...args} />
          </>
        )}
      />
    );
  }
};

function App() {
  return (
    <Router>
      <Switch>
        {/*  <Route path="settings" component={SettingsPage} /> */}
        {/* <Route path="totp" component={TotpDebugger} /> */}
        <AppSidebar>
          {utilities.map((utility) => convertToRoute(utility))}
        </AppSidebar>
      </Switch>
    </Router>
  );
}

export default App;
