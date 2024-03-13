import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export function ProfileToolbar() {
  return () =>
    html`<div
      style=${styleMap({
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
      })}
    >
      <sl-select name="session" placeholder="Session" hoist clearable>
        <sl-icon
          name="window"
          slot="prefix"
          style=${styleMap({ marginRight: "1rem" })}
        ></sl-icon>
        <sl-option value="1">Graduate School</sl-option>
        <sl-option value="2">Augmented Tabflow</sl-option>
      </sl-select>
    </div>`;
}
