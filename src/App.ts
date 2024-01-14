import { html } from "lit";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import gearIcon from "../node_modules/@shoelace-style/shoelace/dist/assets/icons/gear.svg";

export function App() {
  return () =>
    html`<div id="app">
      <sl-button variant="default" size="small" circle>
        <sl-icon src=${gearIcon} label="Settings"></sl-icon>
      </sl-button>
    </div>`;
}
