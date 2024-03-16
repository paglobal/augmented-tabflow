import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export function SessionToolbar() {
  return () =>
    html`<div
      style=${styleMap({
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
      })}
    >
      <sl-select
        name="session"
        placeholder="Session"
        hoist
        clearable
        style=${styleMap({
          border: "0.1rem solid var(--sl-color-neutral-600)",
          borderRadius: "var(--sl-input-border-radius-medium)",
        })}
      >
        <sl-icon
          name="window"
          slot="prefix"
          style=${styleMap({
            marginRight: "1rem",
          })}
        ></sl-icon>
        <sl-option value="1">Graduate School</sl-option>
        <sl-option value="2">Augmented Tabflow</sl-option>
      </sl-select>
    </div>`;
}
