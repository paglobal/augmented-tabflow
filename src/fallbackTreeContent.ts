import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";

export function fallbackTreeContent(errorOccurred?: boolean) {
  let message = "Loading...";
  if (errorOccurred) {
    message = "Error occurred while loading...";
  }

  return html`${h(TreeItem, {
    content: html`${message}`,
    tooltipContent: message,
  })}`;
}
