import { html } from "lit";
import { until } from "lit/directives/until.js";
import { h } from "promethium-js";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";
import { TabGroupColorPatchOrTabIcon } from "./TabGroupColorPatchOrTabIcon";
import {
  setTabGroupTreeAlreadyUpdated,
  tabGroupTreeData,
} from "./services/active";

export function Active() {
  async function tabGroupTree() {
    return (await tabGroupTreeData()).map((tabGroupTreeDataEntry) => {
      return html`
        ${h(TreeItem, {
          tooltipContent: tabGroupTreeDataEntry.title,
          expanded: !tabGroupTreeDataEntry.collapsed,
          async onExpand() {
            setTabGroupTreeAlreadyUpdated(true);
            await chrome.tabGroups.update(tabGroupTreeDataEntry.id, {
              collapsed: false,
            });
          },
          async onCollapse() {
            setTabGroupTreeAlreadyUpdated(true);
            await chrome.tabGroups.update(tabGroupTreeDataEntry.id, {
              collapsed: true,
            });
          },
          actionButtons: html`
            <sl-icon-button name="plus-lg" title="Add Tab"></sl-icon-button>
            <sl-icon-button name="pen" title="Edit"></sl-icon-button>
            <sl-icon-button name="save" title="Save"></sl-icon-button>
            <sl-icon-button
              name="x-lg"
              title="Close"
              @click=${async (e: Event) => {
                e.stopPropagation();
                const tabIds = tabGroupTreeDataEntry.tabs.map(
                  (tab) => tab.id,
                ) as [number, ...number[]];
                await chrome.tabs.ungroup(tabIds);
                tabGroupTreeDataEntry.tabs.forEach(async (tab) => {
                  await chrome.tabs.remove(tab.id);
                });
              }}
            ></sl-icon-button>
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
                    <sl-icon-button
                      name="x-lg"
                      title="Close"
                      @click=${() => chrome.tabs.remove(tab.id)}
                    ></sl-icon-button>
                  `,
                  content: html`
                    ${h(TabGroupColorPatchOrTabIcon, {
                      pageUrl: tab.status === "loading" ? undefined : tab.url,
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

  return () => html`
    ${h(Tree, {
      contentFn: () => html`${until(tabGroupTree(), html`Loading...`)}`,
    })}
  `;
}
