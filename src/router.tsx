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

import "./index.css";

import { Router, Route } from "wouter";
import AppSidebar from "./components/sidebar";
import utilities, { type UtilityMeta } from "./utilities/meta";

const convertToRoute = (utility: UtilityMeta) => {
  if ("items" in utility) {
    // utility group
    return (
      <Route path={utility.key} nest>
        {utility.items.map((item) => convertToRoute(item))}
      </Route>
    );
  } else {
    // single utility
    return <Route path={utility.key} component={utility.page} />;
  }
};

function App() {
  return (
    <Router>
      <AppSidebar>
        {utilities.map((utility) => convertToRoute(utility))}
      </AppSidebar>
    </Router>
  );
}

export default App;
