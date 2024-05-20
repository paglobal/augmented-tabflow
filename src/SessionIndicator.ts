import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { titles } from "../constants";
import { sessionsTreeDialogRef } from "./App";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { currentSessionData } from "./sessionService";

export function SessionIndicator() {
  function currentSessionTitle() {
    const _currentSessionData = currentSessionData();
    return _currentSessionData
      ? _currentSessionData.title
      : titles.unsavedSession;
  }

  function buttonVariant() {
    const _currentSessionData = currentSessionData();
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
        variant=${buttonVariant()}
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
        >${currentSessionTitle()}</sl-button
      >
    </div>`;
}
