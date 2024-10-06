import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { type SlSelectionChangeEvent } from "@shoelace-style/shoelace/dist/events/sl-selection-change";
import { notifyWithErrorMessageAndReloadButton } from "./utils";

export function Tree(props: {
  contentFn: () => unknown;
  fullHeight?: boolean;
}) {
  return () => {
    return html`
      <sl-tree
        style=${styleMap({
          "--indent-guide-width": "1px",
          // calculate the space occupied by everything above the tree plus additional `1.5rem` padding
          // please recalculate accordingly if you change the space occupied by anything above the tree
          height: props.fullHeight
            ? "calc(100vh - 7.75rem - 1.5rem)"
            : undefined,
          overflowY: "auto",
        })}
        selection="leaf"
        tabindex="-1"
        @sl-selection-change=${(e: SlSelectionChangeEvent) => {
          // @handled
          try {
            e.detail.selection.forEach((treeItem) => treeItem.click());
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
      >
        ${props.contentFn()}
      </sl-tree>
    `;
  };
}
