import "./index.css";

import { Router, Route } from "wouter";

import AppSidebar from "./components/sidebar";
import JsonFormatterPage from "./utilities/formatter/json";
import HtmlEncoderDecoderPage from "./utilities/formatter/html";
import { CssBeautifyMinifyTool } from "./utilities/formatter/css";

import IdGeneratorPage from "./utilities/generators/id";

function App() {
  return (
    <Router>
      <AppSidebar>
        <Route path="/formatter" nest>
          <Route path="json" component={JsonFormatterPage} />
          <Route path="html" component={HtmlEncoderDecoderPage} />
          <Route path="css" component={CssBeautifyMinifyTool} />
        </Route>
        <Route path="/generators" nest>
          <Route path="id" component={IdGeneratorPage} />
        </Route>
        {/* <Route path="js" component={JsFormatterPage} /> */}
      </AppSidebar>
    </Router>
  );
}

export default App;
