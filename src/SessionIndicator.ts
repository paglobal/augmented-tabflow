import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import { currentSessionData } from "./sessionService";
import { titles } from "../constants";
import { sessionsTreeDialogRef } from "./App";
import { notifyWithErrorMessageAndReloadButton } from "./utils";

export function SessionIndicator() {
  async function currentSessionTitle() {
    // @handled
    try {
      const _currentSessionData = await currentSessionData();

      return _currentSessionData
        ? _currentSessionData.title
        : titles.unsavedSession;
    } catch (error) {
      notifyWithErrorMessageAndReloadButton();

      return "Error!";
    }
  }

  async function buttonVariant() {
    // @handled
    try {
      const _currentSessionData = await currentSessionData();

      return _currentSessionData ? "primary" : "default";
    } catch (error) {
      notifyWithErrorMessageAndReloadButton();

      return "danger";
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
        variant=${until(buttonVariant(), "default")}
        outline
        style=${styleMap({ width: "100%" })}
        @click=${() => {
          // @handled
          try {
            sessionsTreeDialogRef.value?.show();
          } catch (error) {
            notifyWithErrorMessageAndReloadButton();
          }
        }}
        title="Show Sessions"
        >${until(currentSessionTitle(), titles.unsavedSession)}</sl-button
      >
    </div>`;
}
