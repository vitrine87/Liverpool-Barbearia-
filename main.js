import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { html } from "./lib/html.js";
import { App } from "./App.js";

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);
