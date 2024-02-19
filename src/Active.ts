import { html } from "lit";
import { until } from "lit/directives/until.js";
import { h } from "promethium-js";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";
import { TabGroupColorPatchOrTabIcon } from "./TabGroupColorPatchOrTabIcon";
import xLgIcon from "./assets/icons/x-lg.svg";
import saveIcon from "./assets/icons/save.svg";
import plusLgIcon from "./assets/icons/plus-lg.svg";
import penIcon from "./assets/icons/pen.svg";
import {
  setTabGroupTreeAlreadyUpdated,
  tabGroupTreeData,
} from "./services/active";

async function tabGroupTree() {
  return (await tabGroupTreeData()).map((tabGroupTreeDataEntry) => {
    return html`
      ${h(TreeItem, {
        tooltipContent: tabGroupTreeDataEntry.title,
        expanded: !tabGroupTreeDataEntry.collapsed,
        onExpand() {
          setTabGroupTreeAlreadyUpdated(true);
          chrome.tabGroups.update(tabGroupTreeDataEntry.id, {
            collapsed: false,
          });
        },
        onCollapse() {
          setTabGroupTreeAlreadyUpdated(true);
          chrome.tabGroups.update(tabGroupTreeDataEntry.id, {
            collapsed: true,
          });
        },
        actionButtons: html`
          <sl-icon-button src=${plusLgIcon} title="Add Tab"></sl-icon-button>
          <sl-icon-button src=${penIcon} title="Edit"></sl-icon-button>
          <sl-icon-button src=${saveIcon} title="Save"></sl-icon-button>
          <sl-icon-button src=${xLgIcon} title="Close"></sl-icon-button>
        `,
        content: html`
          ${h(TabGroupColorPatchOrTabIcon, {
            color: tabGroupTreeDataEntry.color,
          })}
          ${tabGroupTreeDataEntry.title}
          ${tabGroupTreeDataEntry.tabs.map(
            (tab) => html`
              ${h(TreeItem, {
                tooltipContent: tab.title,
                selected: tab.active,
                onSelect() {
                  setTabGroupTreeAlreadyUpdated(true);
                  chrome.tabs.update(tab.id, { active: true });
                },
                actionButtons: html`
                  <sl-icon-button src=${xLgIcon} title="Close"></sl-icon-button>
                `,
                content: html`
                  ${h(TabGroupColorPatchOrTabIcon, {
                    pageUrl: tab.status === "complete" ? tab.url : undefined,
                  })}
                  ${tab.title}
                `,
              })}
            `,
          )}
        `,
      })}
    `;
  });
}

export function Active() {
  return () => html`
    ${h(Tree, {
      contentFn: () => html`${until(tabGroupTree(), html`Loading...`)}`,
    })}
  `;
}
