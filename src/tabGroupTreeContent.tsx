import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
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
  navigateDialogRef,
  navigateInputRef,
  sessionWindowsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEditedTabGroupId,
  setCurrentlyEjectedTabOrTabGroup,
  setCurrentlyNavigatedTabId,
  setFirstTabInNewTabGroup,
} from "./App";
import { lockNames, newTabUrls, tabGroupTypes } from "../constants";
import {
  notifyWithErrorMessageAndReloadButton,
  randomTabGroupColorValue,
} from "./utils";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type TabGroupTreeData } from "../sharedUtils";

export function tabGroupTreeContent() {
  // @handled
  const _tabGroupTreeData = tabGroupTreeData();
  const tabGroupTreeContent = repeat(
    _tabGroupTreeData,
    (tabGroup) => tabGroup.id,
    (tabGroup) => {
      return (
        <TreeItem
          tooltipContent={tabGroup.title as string}
          expanded={!tabGroup.collapsed}
          onExpand={(e: Event) => {
            // @handled
            try {
              e.stopPropagation();
              expandTabGroup(tabGroup);
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
          onCollapse={(e: Event) => {
            // @handled
            try {
              e.stopPropagation();
              collapseTabGroup(tabGroup);
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
          draggableOptions={
            tabGroup.type !== tabGroupTypes.normal
              ? undefined
              : {
                  getInitialData() {
                    return {
                      type: "tabGroup",
                      tabGroup: tabGroup,
                    };
                  },
                }
          }
          dropTargetOptions={
            tabGroup.type !== tabGroupTypes.normal
              ? undefined
              : {
                  getData() {
                    return { type: "tabGroup" };
                  },
                  async onDrop({ self, source }) {
                    // @error
                    const closestEdgeOfTarget = extractClosestEdge(self.data);
                    let index = -1;
                    const tabGroupIndex = tabGroup.tabs[0].index;
                    const otherTabGroupIndex = (
                      source.data.tabGroup as TabGroupTreeData[number]
                    ).tabs[0].index;
                    const {
                      title: otherTabGroupTitle,
                      color: otherTabGroupColor,
                      collapsed: otherTabGroupCollapsed,
                      tabs: otherTabGroupTabs,
                    } = source.data.tabGroup as TabGroupTreeData[number];
                    const otherTabGroupTabIds = otherTabGroupTabs.map(
                      (tab) => tab.id,
                    ) as [number, ...number[]];
                    if (
                      closestEdgeOfTarget === "top" &&
                      otherTabGroupIndex > tabGroupIndex
                    ) {
                      index = tabGroupIndex;
                    } else if (
                      closestEdgeOfTarget === "bottom" &&
                      otherTabGroupIndex > tabGroupIndex
                    ) {
                      index = tabGroupIndex + 1;
                    } else if (
                      closestEdgeOfTarget === "top" &&
                      otherTabGroupIndex < tabGroupIndex
                    ) {
                      index = tabGroupIndex - 1;
                    } else if (
                      closestEdgeOfTarget === "bottom" &&
                      otherTabGroupIndex < tabGroupIndex
                    ) {
                      index = tabGroupIndex;
                    }
                    if (index === -1) {
                      return;
                    }
                    await navigator.locks.request(
                      lockNames.applyUpdates,
                      // @error
                      async () => {
                        await chrome.tabs.move(otherTabGroupTabIds, { index });
                        const newTabGroupId = await chrome.tabs.group({
                          tabIds: otherTabGroupTabIds,
                        });
                        await chrome.tabGroups.update(newTabGroupId, {
                          title: otherTabGroupTitle,
                          color: otherTabGroupColor,
                          collapsed: otherTabGroupCollapsed,
                        });
                      },
                    );
                  },
                }
          }
          actionButtons={html`
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
                  @click=${async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      setCurrentlyEditedTabGroupId(tabGroup.id);
                      if (
                        editTabGroupDialogRefs.input.value &&
                        editTabGroupDialogRefs.select.value
                      ) {
                        editTabGroupDialogRefs.input.value.value =
                          tabGroup.title as string;
                        setTimeout(() => {
                          editTabGroupDialogRefs.input.value?.select();
                        });
                        editTabGroupDialogRefs.select.value.value =
                          tabGroup.color;
                      }
                      await editTabGroupDialogRefs.dialog.value?.show();
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`}
            ${tabGroup.type === tabGroupTypes.pinned
              ? html`
                  <sl-icon-button
                    name="pin-angle-fill"
                    title="Unpin Tabs"
                    @click=${async (e: Event) => {
                      // @handled
                      try {
                        e.stopPropagation();
                        for (const tab of tabGroup.tabs) {
                          await chrome.tabs.update(tab.id!, { pinned: false });
                        }
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
                    title="Pin Tabs"
                    @click=${async (e: Event) => {
                      // @handled
                      try {
                        e.stopPropagation();
                        for (const tab of tabGroup.tabs) {
                          await chrome.tabs.update(tab.id!, { pinned: true });
                        }
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                  ></sl-icon-button>
                `}
            ${tabGroup.type !== tabGroupTypes.normal
              ? html`
                  <sl-icon-button
                    name="folder"
                    title="Group Tabs"
                    @click=${(e: Event) => {
                      // @handled
                      try {
                        e.stopPropagation();
                        chrome.tabs.group({
                          tabIds: tabGroup.tabs.map((tab) => tab.id) as [
                            number,
                            ...number[],
                          ],
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
                    name="folder-minus"
                    title="Ungroup Tabs"
                    @click=${(e: Event) => {
                      // @handled
                      try {
                        e.stopPropagation();
                        chrome.tabs.ungroup(
                          tabGroup.tabs.map((tab) => tab.id) as [
                            number,
                            ...number[],
                          ],
                        );
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                  ></sl-icon-button>
                `}
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
                      await sessionWindowsTreeDialogRef.value?.show();
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>`}
            ${tabGroup.type !== tabGroupTypes.normal &&
            tabGroup.type !== tabGroupTypes.ungrouped
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
          `}
        >
          {html`
            ${(
              <>
                <TreeItemColorPatchOrIcon
                  color={tabGroup.color}
                  icon={tabGroup.icon}
                />
                {tabGroup.title}
                {repeat(
                  tabGroup.tabs,
                  (tab) => tab.id,
                  (tab) => {
                    return (
                      <TreeItem
                        tooltipContent={tab.title as string}
                        selected={tab.active}
                        onSelect={async (e: MouseEvent) => {
                          // @handled
                          try {
                            e.stopPropagation();
                            await activateTab(tab);
                            (document.activeElement as HTMLElement).blur();
                          } catch (error) {
                            console.error(error);
                            notifyWithErrorMessageAndReloadButton();
                          }
                        }}
                        draggableOptions={{
                          getInitialData() {
                            return {
                              type: "tab",
                              index: tab.index,
                              id: tab.id,
                            };
                          },
                        }}
                        dropTargetOptions={{
                          getData() {
                            return { type: "tab" };
                          },
                          async onDrop({ self, source }) {
                            // @error
                            const closestEdgeOfTarget = extractClosestEdge(
                              self.data,
                            );
                            let index = -1;
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
                            if (index === -1) {
                              return;
                            }
                            await navigator.locks.request(
                              lockNames.applyUpdates,
                              async () => {
                                if (
                                  tab.groupId !==
                                  chrome.tabGroups.TAB_GROUP_ID_NONE
                                ) {
                                  await chrome.tabs.group({
                                    tabIds: source.data.id as NonNullable<
                                      chrome.tabs.Tab["id"]
                                    >,
                                    groupId: tab.groupId,
                                  });
                                } else if (
                                  tabGroup.type === tabGroupTypes.pinned
                                ) {
                                  await chrome.tabs.update(
                                    source.data.id as NonNullable<
                                      chrome.tabs.Tab["id"]
                                    >,
                                    { pinned: true },
                                  );
                                } else {
                                  await chrome.tabs.ungroup(
                                    source.data.id as NonNullable<
                                      chrome.tabs.Tab["id"]
                                    >,
                                  );
                                  await chrome.tabs.update(
                                    source.data.id as NonNullable<
                                      chrome.tabs.Tab["id"]
                                    >,
                                    { pinned: false },
                                  );
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
                        }}
                        actionButtons={html`
                          <sl-icon-button
                            name="pen"
                            title="Edit"
                            @click=${async (e: Event) => {
                              // @handled
                              try {
                                e.stopPropagation();
                                setCurrentlyNavigatedTabId(tab.id);
                                if (navigateInputRef.value) {
                                  navigateInputRef.value.value =
                                    tab.url as string;
                                  setTimeout(() => {
                                    navigateInputRef.value?.select();
                                  });
                                }
                                await navigateDialogRef.value?.show();
                              } catch (error) {
                                console.error(error);
                                notifyWithErrorMessageAndReloadButton();
                              }
                            }}
                          ></sl-icon-button>
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
                          ${tabGroup.type !== tabGroupTypes.normal
                            ? null
                            : html`
                                <sl-icon-button
                                  name="folder-minus"
                                  title="Remove From Group"
                                  @click=${(e: Event) => {
                                    // @handled
                                    try {
                                      e.stopPropagation();
                                      chrome.tabs.ungroup(tab.id as number);
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
                            @click=${async (e: Event) => {
                              // @handled
                              try {
                                e.stopPropagation();
                                setFirstTabInNewTabGroup(tab);
                                if (addTabGroupSelectRef.value) {
                                  addTabGroupSelectRef.value.value =
                                    randomTabGroupColorValue();
                                }
                                await addTabGroupDialogRef.value?.show();
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
                                await sessionWindowsTreeDialogRef.value?.show();
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
                        `}
                      >
                        {html`
                          ${(
                            <>
                              {tab.mutedInfo?.muted ? (
                                <TreeItemColorPatchOrIcon icon="MaterialSymbolsNoSoundOutlineRounded" />
                              ) : null}
                              {tab.audible && !tab.mutedInfo?.muted ? (
                                <TreeItemColorPatchOrIcon icon="MaterialSymbolsVolumeUpOutlineRounded" />
                              ) : null}
                              {
                                <TreeItemColorPatchOrIcon
                                  pageUrl={tab.url}
                                  showSpinner={
                                    tab.status === "loading" &&
                                    !newTabUrls.includes(tab.url as string)
                                      ? true
                                      : false
                                  }
                                />
                              }
                              {tab.title}
                            </>
                          )}
                        `}
                      </TreeItem>
                    );
                  },
                )}
              </>
            )}
          `}
        </TreeItem>
      );
    },
  );

  return tabGroupTreeContent;
}
