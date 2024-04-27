import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import { currentSessionData } from "./sessionService";
import { unsavedSessionTitle } from "../constants";
import { sessionsTreeDialogRef } from "./App";

export function SessionIndicator() {
  async function currentSessionTitle() {
    // @fallback
    const _currentSessionData = await currentSessionData();

    return _currentSessionData
      ? _currentSessionData.title
      : unsavedSessionTitle;
  }

  async function buttonVariant() {
    // @fallback
    const _currentSessionData = await currentSessionData();

    return _currentSessionData ? "primary" : "default";
  }

  return () =>
    html`<div
      style=${styleMap({
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
      })}
    >
      <sl-button
        variant=${until(buttonVariant(), "default")}
        outline
        style=${styleMap({ width: "100%" })}
        @click=${() => {
          // @error
          sessionsTreeDialogRef.value?.show();
        }}
        title="Show Sessions"
        >${until(currentSessionTitle(), unsavedSessionTitle)}</sl-button
      >
    </div>`;
}
