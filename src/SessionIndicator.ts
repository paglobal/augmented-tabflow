import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import { SessionData, sessionStorageKeys, titles } from "../constants";
import { sessionsTreeDialogRef } from "./App";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { getStorageData } from "../sharedUtils";

export function SessionIndicator() {
  async function currentSessionTitle() {
    // @handled
    try {
      const currentSessionData = await getStorageData<SessionData>(
        sessionStorageKeys.currentSessionData,
      );

      return currentSessionData
        ? currentSessionData.title
        : titles.unsavedSession;
    } catch (error) {
      console.error(error);

      return "Error!";
    }
  }

  async function buttonVariant() {
    // @handled
    try {
      const currentSessionData = await getStorageData<SessionData>(
        sessionStorageKeys.currentSessionData,
      );

      return currentSessionData ? "primary" : "default";
    } catch (error) {
      console.error(error);

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
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
        title="Show Sessions"
        >${until(currentSessionTitle(), titles.unsavedSession)}</sl-button
      >
    </div>`;
}
