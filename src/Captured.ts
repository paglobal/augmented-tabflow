import { html } from "lit";
import { Tree } from "./Tree";
import { h } from "promethium-js";

export function Captured() {
  return () => html`
    ${h(Tree, {
      contentFn: () => html`heyy!!`,
    })}
  `;
}
