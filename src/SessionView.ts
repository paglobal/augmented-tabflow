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
import { tabGroupTypes } from "../constants";

export function SessionView() {
  const newTabUrls = ["chrome://newtab/", "chrome://new-tab-page/"];

  async function tabGroupTree() {
    // TODO: handle possible error with fallback content and functional alert
    // TODO: indicate if audio is playing in tab
    // TODO: implement drag-and-drop for tabs and tab groups
    // TODO: implement "recently closed" tab groups feature
    // TODO: implement "copy tab groups to session" feature
    // TODO: implement "copy tabs to session" feature
    // TODO: implement "move tab group to new window" feature
    // TODO: prioritize tabs groups in current window
    // TODO: implement "ungrouped tabs" in tab group tree
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
            ${tabGroup.type !== tabGroupTypes.ungrouped
              ? html`<sl-icon-button
                  name="pen"
                  title="Edit"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    setCurrentlyEditedTabGroupId(tabGroup.id);
                    editTabGroupDialogRefs.dialog.value?.show();
                    // use `setTimeout` to ensure that the cursor gets placed in the right position in the input
                    setTimeout(() => {
                      if (
                        editTabGroupDialogRefs.input.value &&
                        editTabGroupDialogRefs.select.value
                      ) {
                        editTabGroupDialogRefs.input.value.value =
                          tabGroup.title as string;
                        editTabGroupDialogRefs.select.value.value =
                          tabGroup.color;
                      }
                    });
                  }}
                ></sl-icon-button>`
              : null}
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
              icon: tabGroup.icon,
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
              contentFn: () =>
                html`${until(tabGroupTree(), fallbackContent())}`,
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
