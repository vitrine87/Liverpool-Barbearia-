// Why htm instead of JSX?
// JSX needs Babel to transpile in the browser (~300kb+ parsed & run on every
// page load — rough on weaker Android CPUs). htm is a ~600 byte tagged
// template literal parser that produces the exact same React.createElement
// calls, with no build step and no runtime transpilation cost.
//
// Usage in a component file:
//   import React from "https://esm.sh/react@18.3.1";
//   import { html } from "../lib/html.js";
//   export function Button({ label }) {
//     return html`<button className="btn">${label}</button>`;
//   }
//
// Notes:
// - IMPORTANT: use `className`, not `class` — htm's own docs assume Preact
//   (which accepts `class` natively), but this project binds htm to
//   React.createElement, and React only recognizes `className`.
// - Self-close every tag: <img /> not <img>.
// - Interpolate components as ${Tag} inside the template, not as JSX <Tag/>
//   text — htm still supports <${Tag} prop=${x} />.

import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";

export const html = htm.bind(React.createElement);
