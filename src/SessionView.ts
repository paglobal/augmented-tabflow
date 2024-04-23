import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { choose } from "lit/directives/choose.js";
import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { currentSessionId } from "./sessionService";

export function SessionView() {
  return () => html`
    ${choose(
      currentSessionId(),
      [
        [
          null,
          () =>
            html`${h(Tree, {
              contentFn: () => html`${fallbackTreeContent()}`,
            })}`,
        ],
        [
          undefined,
          () =>
            html`${h(Tree, {
              contentFn: () =>
                html`${until(sessionsTreeContent(), fallbackTreeContent())}`,
              fullHeight: true,
            })}`,
        ],
        [
          "",
          () =>
            html`${h(Tree, {
              contentFn: () =>
                html`${until(sessionsTreeContent(), fallbackTreeContent())}`,
              fullHeight: true,
            })}`,
        ],
      ],
      () =>
        html`${h(Tree, {
          contentFn: () =>
            html`${until(tabGroupTreeContent(), fallbackTreeContent())}`,
          fullHeight: true,
        })}`,
    )}
  `;
}
