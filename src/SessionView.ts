import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { SessionData, sessionStorageKeys } from "../constants";
import { getStorageData } from "../sharedUtils";

export function SessionView() {
  async function sessionViewTree() {
    // @handled
    try {
      const currentSessionData = await getStorageData<SessionData>(
        sessionStorageKeys.currentSessionData,
      );
      const sessionLoading = await getStorageData<SessionData>(
        sessionStorageKeys.sessionLoading,
      );
      if (sessionLoading) {
        return html`${h(Tree, {
          contentFn: () => html`${fallbackTreeContent()}`,
        })}`;
      }

      return html`
        ${currentSessionData
          ? html`${h(Tree, {
              contentFn: tabGroupTreeContent,
              fullHeight: true,
            })}`
          : html`${h(Tree, {
              contentFn: () =>
                html`${until(sessionsTreeContent(), fallbackTreeContent())}`,
              fullHeight: true,
            })}`}
      `;
    } catch (error) {
      console.error(error);
      notifyWithErrorMessageAndReloadButton();

      return fallbackTreeContent();
    }
  }

  return () =>
    html`${until(
      sessionViewTree(),
      html`${h(Tree, {
        contentFn: () => html`${fallbackTreeContent()}`,
      })}`,
    )}`;
}
