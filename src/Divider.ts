import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/divider/divider.js";

export function Divider() {
  return () => html`
    <sl-divider style=${styleMap({ margin: "0.5rem 0 0.5rem 0" })}></sl-divider>
  `;
}
