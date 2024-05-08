import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  activateTab,
  addTabToTabGroup,
  closeTabGroup,
  collapseTabGroup,
  expandTabGroup,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setFirstTabInNewTabGroupId,
  tabGroupTreeData,
} from "./sessionService";
import {
  addTabGroupDialogRef,
  editTabGroupDialogRefs,
  moveOrCopyTabGroupToSessionTreeDialogRef,
  moveOrCopyTabToSessionTreeDialogRef,
  setCurrentlyEditedTabGroupId,
} from "./App";
import { newTabUrls, tabGroupTypes } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";

export async function tabGroupTreeContent() {
  // @handled
  try {
    return (await tabGroupTreeData()).map((tabGroup) => {
      return html`
        ${h(TreeItem, {
          tooltipContent: tabGroup.title as string,
          expanded: !tabGroup.collapsed,
          onExpand(e: Event) {
            // @handled
            try {
              e.stopPropagation();
              expandTabGroup(tabGroup);
            } catch (error) {
              notifyWithErrorMessageAndReloadButton();
            }
          },
          onCollapse(e: Event) {
            // @handled
            try {
              e.stopPropagation();
              collapseTabGroup(tabGroup);
            } catch (error) {
              notifyWithErrorMessageAndReloadButton();
            }
          },
          actionButtons: html`
            <sl-icon-button
              name="plus-lg"
              title="Add Tab"
              @click=${(e: Event) => {
                // @handled
                try {
                  e.stopPropagation();
                  addTabToTabGroup(tabGroup);
                } catch (error) {
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>
            ${tabGroup.type === tabGroupTypes.normal
              ? html`<sl-icon-button
                  name="pen"
                  title="Edit"
                  @click=${(e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      setCurrentlyEditedTabGroupId(tabGroup.id);
                      editTabGroupDialogRefs.dialog.value?.show();
                      // use `setTimeout` to ensure that the cursor gets placed in the right position in the input
                      setTimeout(() => {
                        // @handled
                        try {
                          if (
                            editTabGroupDialogRefs.input.value &&
                            editTabGroupDialogRefs.select.value
                          ) {
                            editTabGroupDialogRefs.input.value.value =
                              tabGroup.title as string;
                            editTabGroupDialogRefs.select.value.value =
                              tabGroup.color;
                          }
                        } catch (error) {
                          notifyWithErrorMessageAndReloadButton();
                        }
                      });
                    } catch (error) {
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`
              : null}
            ${tabGroup.type === tabGroupTypes.normal
              ? html`<sl-icon-button
                  name="arrow-up-right"
                  title="Move Or Copy To Session"
                  @click=${async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      setCurrentMovedOrCopiedTabOrTabGroup(tabGroup);
                      await moveOrCopyTabGroupToSessionTreeDialogRef.value?.show();
                    } catch (error) {
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`
              : null}
            <sl-icon-button
              name="x-lg"
              title="Close"
              @click=${async (e: Event) => {
                // @handled
                try {
                  e.stopPropagation();
                  closeTabGroup(tabGroup);
                } catch (error) {
                  notifyWithErrorMessageAndReloadButton();
                }
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
                    // @handled
                    try {
                      e.stopPropagation();
                      activateTab(tab);
                    } catch (error) {
                      notifyWithErrorMessageAndReloadButton();
                    }
                  },
                  actionButtons: html`
                    <sl-icon-button
                      name="plus-circle"
                      title="Add Tab To New Group"
                      @click=${(e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          setFirstTabInNewTabGroupId(tab.id);
                          addTabGroupDialogRef.value?.show();
                        } catch (error) {
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                    <sl-icon-button
                      name="arrow-up-right"
                      title="Move Or Copy To Session"
                      @click=${async (e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          setCurrentMovedOrCopiedTabOrTabGroup(tab);
                          await moveOrCopyTabToSessionTreeDialogRef.value?.show();
                        } catch (error) {
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                    <sl-icon-button
                      name="x-lg"
                      title="Close"
                      @click=${(e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          chrome.tabs.remove(tab.id as number);
                        } catch (error) {
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                  `,
                  content: html`
                    ${tab.mutedInfo?.muted
                      ? h(TreeItemColorPatchOrIcon, {
                          icon: "volume-mute",
                        })
                      : null}
                    ${tab.audible && !tab.mutedInfo?.muted
                      ? h(TreeItemColorPatchOrIcon, {
                          icon: "volume-down",
                        })
                      : null}
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
    // doesn't take effect when used with `until` and a fallback
  } catch (error) {
    notifyWithErrorMessageAndReloadButton();

    return fallbackTreeContent(true);
  }
}
