import { TemplateResult, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import { type SlSelectionChangeEvent } from "@shoelace-style/shoelace/dist/events/sl-selection-change";

export function Tree(props: {
  contentFn: () => TemplateResult;
  fullHeight?: boolean;
}) {
  return () => html`
    <sl-tree
      style=${styleMap({
        "--indent-guide-width": "1px",
        // calculate the space occupied by everything above the tree plus additional `1.5rem` padding
        // please recalculate accordingly if you change the space occupied by anything above the tree
        height: props.fullHeight ? "calc(100vh - 7.75rem - 1.5rem)" : undefined,
        overflowY: "auto",
      })}
      selection="leaf"
      tabindex="-1"
      @sl-selection-change=${(e: SlSelectionChangeEvent) => {
        e.detail.selection.forEach((treeItem) => treeItem.click());
      }}
    >
      ${props.contentFn()}
    </sl-tree>
  `;
}
