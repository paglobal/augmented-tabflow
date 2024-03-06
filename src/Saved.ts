import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";
import { TabGroupColorPatchOrTabIcon } from "./TabGroupColorPatchOrTabIcon";
import { rootBookmarkNodeTreeData } from "./services/saved";

rootBookmarkNodeTreeData();

export function Saved() {
  async function rootBookmarkNodeTree() {
    // TODO: handle possible error with fallback content and functional alert
    return (await rootBookmarkNodeTreeData()).map((bookmarkNode) => {
      const bookmarkNodeTitleStructure = bookmarkNode.title.split("-");
      const savedTabGroupColor = bookmarkNodeTitleStructure[0];
      // necessary to obtain title for saved tab group without the color
      bookmarkNodeTitleStructure.shift();
      const savedTabGroupTitle = bookmarkNodeTitleStructure.join("-");
      return html`
        ${h(TreeItem, {
          tooltipContent: savedTabGroupTitle,
          content: html`
            ${h(TabGroupColorPatchOrTabIcon, {
              color: savedTabGroupColor,
            })}
            ${savedTabGroupTitle}
          `,
        })}
      `;
    });
  }

  function fallbackContent(errorOccurred?: boolean) {
    let message = "Loading saved tab groups...";
    if (errorOccurred) {
      message = "Error occurred while loading saved tab groups...";
    }
    return html`${h(TreeItem, {
      content: html`${message}`,
      tooltipContent: message,
    })}`;
  }

  return () => html`
    ${h(Tree, {
      contentFn: () =>
        html`${until(rootBookmarkNodeTree(), fallbackContent())}`,
    })}
  `;
}
