import { TemplateResult, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import { type SlSelectionChangeEvent } from "@shoelace-style/shoelace/dist/events/sl-selection-change";

export function Tree(props: { contentFn: () => TemplateResult }) {
  return () => html`
    <sl-tree
      style=${styleMap({
        "--indent-guide-width": "1px",
      })}
      selection="leaf"
      @sl-selection-change=${(e: SlSelectionChangeEvent) => {
        e.detail.selection.forEach((treeItem) => treeItem.click());
      }}
    >
      ${props.contentFn()}
    </sl-tree>
  `;
}
