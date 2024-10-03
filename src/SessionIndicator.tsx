import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { titles } from "../constants";
import { sessionsTreeDialogRef } from "./App";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
} from "./sessionService";

export function SessionIndicator() {
  return () => {
    const _currentSessionData = currentSessionData();
    const currentSessionTitle =
      _currentSessionData &&
      _currentSessionData !== currentSessionDataNotAvailable
        ? _currentSessionData?.title
        : titles.unsavedSession;
    const buttonVariant =
      _currentSessionData &&
      _currentSessionData !== currentSessionDataNotAvailable
        ? "primary"
        : "default";

    return html`<div
      style=${styleMap({
        paddingTop: "1.5rem",
        paddingBottom: "0.5rem",
      })}
    >
      <sl-button
        variant=${buttonVariant}
        outline
        style=${styleMap({
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          padding: "0.5rem",
        })}
        @click=${async () => {
          // @handled
          try {
            await sessionsTreeDialogRef.value?.show();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
        title="Show Sessions"
        >${currentSessionTitle}</sl-button
      >
    </div>`;
  };
}
