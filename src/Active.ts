import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";
import { TabGroupColorPatchOrTabIcon } from "./TabGroupColorPatchOrTabIcon";
import {
  setTabGroupTreeAlreadyUpdated,
  tabGroupTreeData,
} from "./services/active";
import { syncStorageKeys } from "./constants";

export function Active() {
  async function tabGroupTree() {
    // TODO: handle possible error with fallback content and functional alert
    return (await tabGroupTreeData()).map((tabGroup) => {
      return html`
        ${h(TreeItem, {
          tooltipContent: tabGroup.title,
          expanded: !tabGroup.collapsed,
          async onExpand() {
            setTabGroupTreeAlreadyUpdated(true);
            await chrome.tabGroups.update(tabGroup.id, {
              collapsed: false,
            });
          },
          async onCollapse() {
            setTabGroupTreeAlreadyUpdated(true);
            await chrome.tabGroups.update(tabGroup.id, {
              collapsed: true,
            });
          },
          actionButtons: html`
            <sl-icon-button
              name="plus-lg"
              title="Add Tab"
              @click=${async (e: Event) => {
                e.stopPropagation();
                const tab = await chrome.tabs.create({});
                chrome.tabs.group({
                  groupId: tabGroup.id,
                  tabIds: [tab.id],
                });
              }}
            ></sl-icon-button>
            <sl-icon-button name="pen" title="Edit"></sl-icon-button>
            <sl-icon-button
              name="save"
              title="Save"
              @click=${async (e: Event) => {
                e.stopPropagation();
                const bookmarkNodeTitle = `${tabGroup.color}-${tabGroup.title}`;
                const rootBookmarkNodeId = (
                  await chrome.storage.sync.get(
                    syncStorageKeys.rootBookmarkNodeId,
                  )
                )[syncStorageKeys.rootBookmarkNodeId];
                if (rootBookmarkNodeId === undefined) {
                  // TODO: handle this error
                } else {
                  const rootBookmarkNodeChildren =
                    await chrome.bookmarks.getChildren(rootBookmarkNodeId);
                  for (const bookmarkNode of rootBookmarkNodeChildren) {
                    if (bookmarkNode.title === bookmarkNodeTitle) {
                      return;
                    }
                  }
                }
                chrome.bookmarks.create({
                  parentId: rootBookmarkNodeId,
                  title: bookmarkNodeTitle,
                });
              }}
            ></sl-icon-button>
            <sl-icon-button
              name="x-lg"
              title="Close"
              @click=${async (e: Event) => {
                e.stopPropagation();
                const tabIds = tabGroup.tabs.map((tab) => tab.id) as [
                  number,
                  ...number[],
                ];
                await chrome.tabs.ungroup(tabIds);
                tabGroup.tabs.forEach(async (tab) => {
                  await chrome.tabs.remove(tab.id);
                });
              }}
            ></sl-icon-button>
          `,
          content: html`
            ${h(TabGroupColorPatchOrTabIcon, {
              color: tabGroup.color,
            })}
            ${tabGroup.title}
            ${tabGroup.tabs.map(
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
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        chrome.tabs.remove(tab.id);
                      }}
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

  function fallbackContent(errorOccurred?: boolean) {
    let message = "Loading active tab groups...";
    if (errorOccurred) {
      message = "Error occurred while loading active tab groups...";
    }
    return html`${h(TreeItem, {
      content: html`${message}`,
      tooltipContent: message,
    })}`;
  }

  return () => html`
    ${h(Tree, {
      contentFn: () => html`${until(tabGroupTree(), fallbackContent())}`,
    })}
  `;
}
