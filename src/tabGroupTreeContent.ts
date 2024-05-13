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
  tabGroupTreeData,
} from "./sessionService";
import {
  addTabGroupDialogRef,
  addTabGroupSelectRef,
  editTabGroupDialogRefs,
  moveOrCopyTabGroupToSessionTreeDialogRef,
  moveOrCopyTabToSessionTreeDialogRef,
  sessionWindowsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEditedTabGroupId,
  setCurrentlyEjectedTabOrTabGroup,
  setFirstTabInNewTabGroup,
} from "./App";
import { lockNames, newTabUrls, tabGroupTypes } from "../constants";
import {
  notifyWithErrorMessageAndReloadButton,
  randomTabGroupColorValue,
} from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

export async function tabGroupTreeContent() {
  // @handled
  try {
    const _tabGroupTreeData = await tabGroupTreeData();
    const tabGroupTreeContent = _tabGroupTreeData.map((tabGroup) => {
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
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          },
          onCollapse(e: Event) {
            // @handled
            try {
              e.stopPropagation();
              collapseTabGroup(tabGroup);
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          },
          draggableOptions:
            tabGroup.type !== tabGroupTypes.normal
              ? undefined
              : {
                  getInitialData() {
                    return {
                      type: "tabGroup",
                      index: tabGroup.tabs[0].index,
                      id: tabGroup.id,
                    };
                  },
                },
          dropTargetOptions:
            tabGroup.type !== tabGroupTypes.normal
              ? undefined
              : {
                  getData() {
                    return { type: "tabGroup" };
                  },
                  async onDrop({ self, source }) {
                    const closestEdgeOfTarget = extractClosestEdge(self.data);
                    let index = -1;
                    // i honestly don't yet understand why we need to do this but somehow it works. too tired to investigate now though. please investigate when you get the time
                    if (
                      closestEdgeOfTarget === "top" &&
                      (source.data.index as number) > tabGroup.tabs[0].index
                    ) {
                      index = tabGroup.tabs[0].index;
                    } else if (
                      closestEdgeOfTarget === "bottom" &&
                      (source.data.index as number) > tabGroup.tabs[0].index
                    ) {
                      index = tabGroup.tabs[0].index + tabGroup.tabs.length;
                    } else if (
                      closestEdgeOfTarget === "top" &&
                      (source.data.index as number) < tabGroup.tabs[0].index
                    ) {
                      index = tabGroup.tabs[0].index - 1;
                    } else if (
                      closestEdgeOfTarget === "bottom" &&
                      (source.data.index as number) < tabGroup.tabs[0].index
                    ) {
                      index = tabGroup.tabs[0].index + tabGroup.tabs.length - 1;
                    }
                    await chrome.tabGroups.move(
                      source.data.id as NonNullable<
                        chrome.tabGroups.TabGroup["id"]
                      >,
                      {
                        index,
                      },
                    );
                  },
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
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>
            ${tabGroup.type !== tabGroupTypes.normal
              ? null
              : html`<sl-icon-button
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
                          console.error(error);
                          notifyWithErrorMessageAndReloadButton();
                        }
                      });
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`}
            ${tabGroup.type !== tabGroupTypes.normal
              ? null
              : html`<sl-icon-button
                  name="box-arrow-in-up-right"
                  title="Move To Window"
                  @click=${async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      setCurrentlyEjectedTabOrTabGroup(tabGroup);
                      sessionWindowsTreeDialogRef.value?.show();
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`}
            ${tabGroup.type !== tabGroupTypes.normal
              ? null
              : html`<sl-icon-button
                  name="arrow-90deg-right"
                  title="Move Or Copy To Session"
                  @click=${async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      setCurrentMovedOrCopiedTabOrTabGroup(tabGroup);
                      await moveOrCopyTabGroupToSessionTreeDialogRef.value?.show();
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`}
            <sl-icon-button
              name="x-lg"
              title="Close"
              @click=${async (e: Event) => {
                // @handled
                try {
                  e.stopPropagation();
                  closeTabGroup(tabGroup);
                } catch (error) {
                  console.error(error);
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
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  },
                  draggableOptions: {
                    getInitialData() {
                      return { type: "tab", index: tab.index, id: tab.id };
                    },
                  },
                  dropTargetOptions: {
                    getData() {
                      return { type: "tab" };
                    },
                    async onDrop({ self, source }) {
                      const closestEdgeOfTarget = extractClosestEdge(self.data);
                      let index = -1;
                      // i honestly don't yet understand why we need to do this but somehow it works. too tired to investigate now though. please investigate when you get the time
                      if (
                        closestEdgeOfTarget === "top" &&
                        (source.data.index as number) > tab.index
                      ) {
                        index = tab.index;
                      } else if (
                        closestEdgeOfTarget === "bottom" &&
                        (source.data.index as number) > tab.index
                      ) {
                        index = tab.index + 1;
                      } else if (
                        closestEdgeOfTarget === "top" &&
                        (source.data.index as number) < tab.index
                      ) {
                        index = tab.index - 1;
                      } else if (
                        closestEdgeOfTarget === "bottom" &&
                        (source.data.index as number) < tab.index
                      ) {
                        index = tab.index;
                      }
                      await navigator.locks.request(
                        lockNames.applyUpdates,
                        async () => {
                          if (
                            tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE
                          ) {
                            await chrome.tabs.group({
                              tabIds: source.data.id as NonNullable<
                                chrome.tabs.Tab["id"]
                              >,
                              groupId: tab.groupId,
                            });
                          }
                          await chrome.tabs.move(
                            source.data.id as NonNullable<
                              chrome.tabs.Tab["id"]
                            >,
                            {
                              index,
                            },
                          );
                        },
                      );
                    },
                  },
                  actionButtons: html`
                    ${tabGroup.type === tabGroupTypes.pinned
                      ? html`
                          <sl-icon-button
                            name="pin-angle-fill"
                            title="Unpin Tab"
                            @click=${(e: Event) => {
                              // @handled
                              try {
                                e.stopPropagation();
                                chrome.tabs.update(tab.id!, {
                                  pinned: false,
                                });
                              } catch (error) {
                                console.error(error);
                                notifyWithErrorMessageAndReloadButton();
                              }
                            }}
                          ></sl-icon-button>
                        `
                      : html`
                          <sl-icon-button
                            name="pin-angle"
                            title="Pin Tab"
                            @click=${(e: Event) => {
                              // @handled
                              try {
                                e.stopPropagation();
                                chrome.tabs.update(tab.id!, {
                                  pinned: true,
                                });
                              } catch (error) {
                                console.error(error);
                                notifyWithErrorMessageAndReloadButton();
                              }
                            }}
                          ></sl-icon-button>
                        `}
                    <sl-icon-button
                      name="plus-circle"
                      title="Add Tab To New Group"
                      @click=${(e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          setFirstTabInNewTabGroup(tab);
                          if (addTabGroupSelectRef.value) {
                            addTabGroupSelectRef.value.value =
                              randomTabGroupColorValue();
                          }
                          addTabGroupDialogRef.value?.show();
                        } catch (error) {
                          console.error(error);
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                    <sl-icon-button
                      name="box-arrow-in-up-right"
                      title="Move To Window"
                      @click=${async (e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          setCurrentlyEjectedTabOrTabGroup(tab);
                          sessionWindowsTreeDialogRef.value?.show();
                        } catch (error) {
                          console.error(error);
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                    <sl-icon-button
                      name="arrow-90deg-right"
                      title="Move Or Copy To Session"
                      @click=${async (e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          setCurrentMovedOrCopiedTabOrTabGroup(tab);
                          await moveOrCopyTabToSessionTreeDialogRef.value?.show();
                        } catch (error) {
                          console.error(error);
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
                          console.error(error);
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                  `,
                  content: html`
                    ${tab.mutedInfo?.muted
                      ? h(TreeItemColorPatchOrIcon, {
                          icon: "MaterialSymbolsNoSoundOutlineRounded",
                        })
                      : null}
                    ${tab.audible && !tab.mutedInfo?.muted
                      ? h(TreeItemColorPatchOrIcon, {
                          icon: "MaterialSymbolsVolumeUpOutlineRounded",
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
    return tabGroupTreeContent;
  } catch (error) {
    console.error(error);

    // TODO: doesn't seem to take effect. investigate
    return fallbackTreeContent();
  }
}
