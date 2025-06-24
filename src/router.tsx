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

import JsonFormatterPage from "./utilities/formatter/json";
import HtmlEncoderDecoderPage from "./utilities/formatter/html";
import { CssBeautifyMinifyTool } from "./utilities/formatter/css";

import IdGeneratorPage from "./utilities/generators/id";
import HashGeneratorPage from "./utilities/generators/hash";

import Base64EncoderDecoderPage from "./utilities/codec/base64";
import RSAKeyGeneratorPage from "./utilities/cryptography/rsa/generator";
import RSAKeyAnalyzerPage from "./utilities/cryptography/rsa/analyzer";
// import RSAKeyConverterPage from "./utilities/cryptography/rsa/converter";

// import HotpDebuggerPage from "./utilities/cryptography/oath/hotp";
import TotpDebuggerPage from "./utilities/cryptography/oath/totp";

function App() {
  return (
    <Router>
      <AppSidebar>
        <Route path="/formatter" nest>
          <Route path="json" component={JsonFormatterPage} />
          <Route path="html" component={HtmlEncoderDecoderPage} />
          <Route path="css" component={CssBeautifyMinifyTool} />
        </Route>
        <Route path="/generator" nest>
          <Route path="id" component={IdGeneratorPage} />
          <Route path="hash" component={HashGeneratorPage} />
        </Route>
        <Route path="/codec" nest>
          <Route path="base64" component={Base64EncoderDecoderPage} />
        </Route>
        <Route path="/cryptography" nest>
          <Route path="rsa" nest>
            <Route path="generator" component={RSAKeyGeneratorPage} />
            <Route path="analyzer" component={RSAKeyAnalyzerPage} />
            {/* <Route path="converter" component={RSAKeyConverterPage} /> */}
          </Route>
          <Route path="oath" nest>
            {/* <Route path="hotp" component={HotpDebuggerPage} /> */}
            <Route path="totp" component={TotpDebuggerPage} />
          </Route>
        </Route>
      </AppSidebar>
    </Router>
  );
}

export default App;
