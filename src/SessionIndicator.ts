import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { currentSessionId } from "./sessionService";
import { unsavedSessionTitle } from "../constants";
import { until } from "lit/directives/until.js";
import { sessionsTreeDialogRef } from "./App";

export function SessionIndicator() {
  async function currentSessionTitle() {
    try {
      const _currentSessionId = currentSessionId();
      console.log(currentSessionId());
      if (_currentSessionId) {
        return (await chrome.bookmarks.get(_currentSessionId))[0].title;
      } else {
        return unsavedSessionTitle;
      }
    } catch (e) {
      return unsavedSessionTitle;
    }
  }

  return () =>
    html`<div
      style=${styleMap({
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
      })}
    >
      <sl-button
        variant=${!currentSessionId() ? "default" : "primary"}
        outline
        style=${styleMap({ width: "100%" })}
        @click=${() => {
          sessionsTreeDialogRef.value?.show();
        }}
        >${until(currentSessionTitle(), unsavedSessionTitle)}</sl-button
      >
    </div>`;
}
