import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";

export function fallbackTreeContent() {
  const message = "Loading...";

  return html`${h(TreeItem, {
    tooltipContent: message,
    actionButtons: html`
      <sl-icon-button
        name="arrow-clockwise"
        title="Reload"
        @click=${async (e: Event) => {
          // @handled
          try {
            e.stopPropagation();
            location.reload();
          } catch (error) {
            console.error(error);
          }
        }}
      ></sl-icon-button>
    `,
    content: html`${h(TreeItemColorPatchOrIcon, {
      showSpinner: true,
    })}${message}`,
  })}`;
}
