import { html } from "lit";
import { h } from "promethium-js";
import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { currentSessionData, sessionLoading } from "./sessionService";

export function SessionView() {
  function sessionViewTree() {
    return html`
      ${sessionLoading()
        ? h(Tree, {
            contentFn: fallbackTreeContent,
          })
        : currentSessionData()
          ? h(Tree, {
              contentFn: tabGroupTreeContent,
              fullHeight: true,
            })
          : h(Tree, {
              contentFn: sessionsTreeContent,
              fullHeight: true,
            })}
    `;
  }

  return () => sessionViewTree();
}
