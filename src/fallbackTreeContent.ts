import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";

export function fallbackTreeContent(errorOccurred?: boolean) {
  let message = "Loading...";
  if (errorOccurred) {
    message = "Error!";
  }

  return html`${h(TreeItem, {
    content: html`${h(TreeItemColorPatchOrIcon, {
      showSpinner: true,
    })}${message}`,
    tooltipContent: message,
  })}`;
}
