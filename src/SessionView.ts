import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { currentSessionData } from "./sessionService";
import { notifyWithErrorMessageAndReloadButton } from "./utils";

export function SessionView() {
  async function sessionViewTree() {
    // @handled
    try {
      const _currentSessionData = await currentSessionData();

      return html`
        ${_currentSessionData
          ? html`${h(Tree, {
              contentFn: () =>
                html`${until(tabGroupTreeContent(), fallbackTreeContent())}`,
              fullHeight: true,
            })}`
          : html`${h(Tree, {
              contentFn: () =>
                html`${until(sessionsTreeContent(), fallbackTreeContent())}`,
              fullHeight: true,
            })}`}
      `;
    } catch (error) {
      notifyWithErrorMessageAndReloadButton();

      return fallbackTreeContent(true);
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
