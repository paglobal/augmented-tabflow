import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { choose } from "lit/directives/choose.js";
import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { currentSessionData } from "./sessionService";

export function SessionView() {
  async function sessionViewTrees() {
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
  }

  return () =>
    html`${until(
      sessionViewTrees(),
      html`${h(Tree, {
        contentFn: () => html`${fallbackTreeContent()}`,
      })}`,
    )}`;
}
