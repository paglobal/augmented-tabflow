import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  addTabToTabGroup,
  closeTabGroup,
  collapseTabGroup,
  expandTabGroup,
} from "./sessionService";
import {
  editTabGroupDialogRefs,
  moveOrCopyTabGroupToSessionTreeDialogRef,
  sessionWindowsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEditedTabGroupId,
  setCurrentlyEjectedTabOrTabGroup,
} from "./App";
import { lockNames, tabGroupTypes } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type TabGroupTreeData } from "../sharedUtils";
import { TabTreeItem } from "./TabTreeItem";

export function TabGroupTreeItem(props: {
  tabGroup: TabGroupTreeData[number];
}) {
  return () => {
    const { tabGroup } = props;

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
                  name="folder-plus"
                  title="Group Tabs"
                  @click=${async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      const newTabGroupId = await chrome.tabs.group({
                        tabIds: tabGroup.tabs.map((tab) => tab.id) as [
                          number,
                          ...number[],
                        ],
                      });
                      const pinnedTabGroup = await chrome.tabs.query({
                        pinned: true,
                        currentWindow: true,
                      });
                      await chrome.tabGroups.move(newTabGroupId, {
                        index: pinnedTabGroup.length,
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
                  return <TabTreeItem tab={tab} tabGroup={tabGroup} />;
                },
              )}
            </>
          )}
        `}
      </TreeItem>
    );
  };
}
