import { html } from "lit";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { TreeItem } from "./TreeItem";
import { TabGroupTreeData } from "../sharedUtils";
import { activateTab, createTabGroup } from "./sessionService";
import {
  moveOrCopyTabToSessionTreeDialogRef,
  sessionWindowsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEjectedTabOrTabGroup,
} from "./App";
import { lockNames, newTabUrls, tabGroupTypes } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  navigateDialogRef,
  navigateInputRef,
  setCurrentlyNavigatedTabId,
} from "./NavigateDialog";

export function TabTreeItem(props: {
  tab: TabGroupTreeData[number]["tabs"][number];
  tabGroup: TabGroupTreeData[number];
}) {
  return () => {
    const { tab, tabGroup } = props;
    return (
      <TreeItem
        tooltipContent={tab.title as string}
        selected={tab.active}
        onSelect={async (e: MouseEvent) => {
          // @handled
          try {
            e.stopPropagation();
            await activateTab(tab);
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
        onDoubleClick={async (e: MouseEvent) => {
          // @handled
          try {
            e.stopPropagation();
            await activateTab(tab);
            close();
          } catch (error) {
            console.error(error);
            // @revisit
            // notifyWithErrorMessageAndReloadButton();
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
            const closestEdgeOfTarget = extractClosestEdge(self.data);
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
            await navigator.locks.request(lockNames.applyUpdates, async () => {
              if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
                await chrome.tabs.group({
                  tabIds: source.data.id as NonNullable<chrome.tabs.Tab["id"]>,
                  groupId: tab.groupId,
                });
              } else if (tabGroup.type === tabGroupTypes.pinned) {
                await chrome.tabs.update(
                  source.data.id as NonNullable<chrome.tabs.Tab["id"]>,
                  { pinned: true },
                );
              } else {
                await chrome.tabs.ungroup(
                  source.data.id as NonNullable<chrome.tabs.Tab["id"]>,
                );
                await chrome.tabs.update(
                  source.data.id as NonNullable<chrome.tabs.Tab["id"]>,
                  { pinned: false },
                );
              }
              await chrome.tabs.move(
                source.data.id as NonNullable<chrome.tabs.Tab["id"]>,
                {
                  index,
                },
              );
            });
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
                  navigateInputRef.value.value = tab.url as string;
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
                  @click=${async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      await chrome.tabs.ungroup(tab.id as number);
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>
              `}
          <sl-icon-button
            name="folder-plus"
            title="Add Tab To New Group"
            @click=${async (e: Event) => {
              // @handled
              try {
                e.stopPropagation();
                await createTabGroup(tab);
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
            @click=${async (e: Event) => {
              // @handled
              try {
                e.stopPropagation();
                await chrome.tabs.remove(tab.id as number);
              } catch (error) {
                console.error(error);
                // @revisit
                // notifyWithErrorMessageAndReloadButton();
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
                    (tab.status === "loading" &&
                      !newTabUrls.includes(tab.url ?? "")) ||
                    tab.pendingUrl
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
  };
}
