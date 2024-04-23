import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import { sessionTreeData } from "./sessionService";
import { setStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";
import { createRef, ref } from "lit/directives/ref.js";
import { type SlSelect } from "@shoelace-style/shoelace";

export const sessionToolbarSelectRef = createRef<SlSelect>();

export function SessionToolbar() {
  async function sessionOptions() {
    return (await sessionTreeData()).map((sessionData) => {
      return html`
        <sl-option value=${sessionData.id}>${sessionData.title}</sl-option>
      `;
    });
  }

  return () => {
    return html`<div
      style=${styleMap({
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
      })}
    >
      <sl-select
        ref=${ref(sessionToolbarSelectRef)}
        name="session"
        defaultValue=""
        hoist
        clearable
        style=${styleMap({
          border: "0.1rem solid var(--sl-color-neutral-600)",
          borderRadius: "var(--sl-input-border-radius-medium)",
        })}
        @sl-change=${(e: Event) =>
          setStorageData(
            sessionStorageKeys.currentSessionId,
            (e.target as HTMLSelectElement).value,
          )}
        @sl-clear=${() =>
          setStorageData(sessionStorageKeys.currentSessionId, "")}
      >
        <sl-icon
          name="window"
          slot="prefix"
          style=${styleMap({
            marginRight: "1rem",
          })}
        ></sl-icon>
        ${until(sessionOptions(), null)}
        <sl-option value="">Unsaved Session</sl-option>
      </sl-select>
    </div>`;
  };
}
