import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { choose } from "lit/directives/choose.js";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  activateTab,
  addTabToTabGroup,
  closeTabGroup,
  collapseTabGroup,
  currentSession,
  expandTabGroup,
  sessionTreeData,
  tabGroupTreeData,
} from "./sessionService";
import {
  editTabGroupDialogRefs,
  helpDialogRef,
  saveCurrentSessionDialogRef,
  setCurrentlyEditedTabGroupId,
} from "./App";

export function SessionView() {
  const newTabUrls = ["chrome://newtab/", "chrome://new-tab-page/"];

  async function tabGroupTree() {
    // TODO: handle possible error with fallback content and functional alert
    // TODO: indicate if audio is playing in tab
    // TODO: implement drag-and-drop for tabs and tab groups
    // TODO: implement recently closed tab groups feature
    // TODO: implement "copy tab group to session" feature
    // TODO: implement "copy tab to session" feature
    // TODO: implement "move tab group to new window" feature
    return (await tabGroupTreeData()).map((tabGroup) => {
      return html`
        ${h(TreeItem, {
          tooltipContent: tabGroup.title as string,
          expanded: !tabGroup.collapsed,
          onExpand(e: Event) {
            e.stopPropagation();
            expandTabGroup(tabGroup);
          },
          onCollapse(e: Event) {
            e.stopPropagation();
            collapseTabGroup(tabGroup);
          },
          actionButtons: html`
            <sl-icon-button
              name="plus-lg"
              title="Add Tab"
              @click=${(e: Event) => {
                e.stopPropagation();
                addTabToTabGroup(tabGroup);
              }}
            ></sl-icon-button>
            <sl-icon-button
              name="pen"
              title="Edit"
              @click=${(e: Event) => {
                e.stopPropagation();
                setCurrentlyEditedTabGroupId(tabGroup.id);
                if (
                  editTabGroupDialogRefs.input.value &&
                  editTabGroupDialogRefs.select.value
                ) {
                  editTabGroupDialogRefs.dialog.value?.show();
                  editTabGroupDialogRefs.input.value.value =
                    tabGroup.title as string;
                  editTabGroupDialogRefs.select.value.value = tabGroup.color;
                }
              }}
            ></sl-icon-button>
            <sl-icon-button
              name="x-lg"
              title="Close"
              @click=${async (e: Event) => {
                e.stopPropagation();
                closeTabGroup(tabGroup);
              }}
            ></sl-icon-button>
          `,
          content: html`
            ${h(TreeItemColorPatchOrIcon, {
              color: tabGroup.color,
            })}
            ${tabGroup.title}
            ${tabGroup.tabs.map(
              (tab) => html`
                ${h(TreeItem, {
                  tooltipContent: tab.title as string,
                  selected: tab.active,
                  onSelect(e: Event) {
                    e.stopPropagation();
                    activateTab(tab);
                  },
                  actionButtons: html`
                    <sl-icon-button
                      name="x-lg"
                      title="Close"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        chrome.tabs.remove(tab.id as number);
                      }}
                    ></sl-icon-button>
                  `,
                  content: html`
                    ${h(TreeItemColorPatchOrIcon, {
                      pageUrl: tab.url,
                      showSpinner:
                        tab.status === "loading" &&
                        !newTabUrls.includes(tab.url as string)
                          ? true
                          : false,
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

  async function sessionTree() {
    const sessionTree = (await sessionTreeData()).map((session) => {
      return html`
        ${h(TreeItem, {
          content: html`${h(TreeItemColorPatchOrIcon, {
            icon: "window",
          })}${session.title}`,
          tooltipContent: session.title,
          onSelect(e: Event) {
            e.stopPropagation();
          },
        })}
      `;
    });

    sessionTree?.unshift(
      html`${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "question-circle",
        })}
        Help`,
        tooltipContent: "Help",
        onSelect(e: Event) {
          e.stopPropagation();
          helpDialogRef.value?.show();
        },
      })}`,
      html`${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window-plus",
        })}
        Save Current Session`,
        tooltipContent: "Save Current Session",
        onSelect(e: Event) {
          e.stopPropagation();
          saveCurrentSessionDialogRef.value?.show();
        },
      })}`,
    );

    return sessionTree;
  }

  function fallbackContent(errorOccurred?: boolean) {
    let message = "Loading...";
    if (errorOccurred) {
      message = "Error occurred while loading...";
    }

    return html`${h(TreeItem, {
      content: html`${message}`,
      tooltipContent: message,
    })}`;
  }

  return () => html`
    ${choose(
      currentSession(),
      [
        [
          null,
          () =>
            html`${h(Tree, {
              contentFn: () => html`${fallbackContent()}`,
            })}`,
        ],
        [
          undefined,
          () =>
            html`${h(Tree, {
              contentFn: () => html`${until(sessionTree(), fallbackContent())}`,
            })}`,
        ],
      ],
      () =>
        html`${h(Tree, {
          contentFn: () => html`${until(tabGroupTree(), fallbackContent())}`,
        })}`,
    )}
  `;
}
