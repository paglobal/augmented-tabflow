import { html } from "lit";
import { h } from "promethium-js";
import { DirectiveResult } from "lit/directive.js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { fallbackTreeContent } from "./fallbackTreeContent";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
  openNewSession,
  sessionsTreeData,
} from "./sessionService";
import {
  deleteSessionDialogRef,
  editSessionDialogRef,
  editSessionInputRef,
  helpDialogRef,
  newSessionDialogRef,
  saveCurrentSessionDialogRef,
  setCurrentlyDeletedSessionId,
  setCurrentlyDeletedSessionIsCurrentSession,
  setCurrentlyEditedSessionId,
} from "./App";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { sendMessage } from "../sharedUtils";
import { messageTypes } from "../constants";

export function sessionsTreeContent() {
  // @handled
  try {
    const _currentSessionData = currentSessionData();
    const _sessionsTreeData = sessionsTreeData().filter((sessionData) =>
      _currentSessionData !== currentSessionDataNotAvailable
        ? sessionData.id !== _currentSessionData?.id
        : true,
    );
    const sessionsTreeContent: Array<DirectiveResult | null> =
      _sessionsTreeData.map((sessionData) => {
        return (
          <TreeItem
            tooltipContent={sessionData.title}
            onSelect={async (e: Event) => {
              // @handled
              try {
                e.stopPropagation();
                await openNewSession(sessionData);
              } catch (error) {
                console.error(error);
                notifyWithErrorMessageAndReloadButton();
              }
            }}
            draggableOptions={{
              getInitialData() {
                return {
                  type: "bookmark",
                  sessionData: sessionData,
                };
              },
            }}
            dropTargetOptions={{
              getData() {
                return { type: "bookmark" };
              },
              async onDrop({ self, source }) {
                const closestEdgeOfTarget = extractClosestEdge(self.data);
                let index = -1;
                const otherSessionData = source.data
                  .sessionData as chrome.bookmarks.BookmarkTreeNode;
                if (closestEdgeOfTarget === "top") {
                  index = sessionData.index ?? -1;
                } else if (closestEdgeOfTarget === "bottom") {
                  index = (sessionData.index ?? 0) + 1;
                }
                if (index === -1) {
                  return;
                }
                await chrome.bookmarks.move(otherSessionData.id, {
                  parentId: otherSessionData.parentId,
                  index,
                });
              },
            }}
            actionButtons={html`
              <sl-icon-button
                name="pen"
                title="Edit Session Title"
                @click=${async (e: Event) => {
                  // @handled
                  try {
                    e.stopPropagation();
                    if (editSessionInputRef.value) {
                      setCurrentlyEditedSessionId(sessionData.id);
                      editSessionInputRef.value.value = sessionData.title;
                      setTimeout(() => {
                        editSessionInputRef.value?.select();
                      });
                      await editSessionDialogRef.value?.show();
                    }
                  } catch (error) {
                    console.error(error);
                    notifyWithErrorMessageAndReloadButton();
                  }
                }}
              ></sl-icon-button>
              <sl-icon-button
                name="trash"
                title="Delete Session"
                @click=${async (e: Event) => {
                  // @handled
                  try {
                    e.stopPropagation();
                    setCurrentlyDeletedSessionId(sessionData.id);
                    setCurrentlyDeletedSessionIsCurrentSession(false);
                    await deleteSessionDialogRef.value?.show();
                  } catch (error) {
                    console.error(error);
                    notifyWithErrorMessageAndReloadButton();
                  }
                }}
              ></sl-icon-button>
            `}
          >
            {html`${h(TreeItemColorPatchOrIcon, {
              icon: "window",
            })}${sessionData.title}`}
          </TreeItem>
        );
      });
    sessionsTreeContent.unshift(
      <TreeItem
        tooltipContent="Help"
        onSelect={async (e: Event) => {
          // @handled
          try {
            e.stopPropagation();
            await helpDialogRef.value?.show();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
      >
        {html`${h(TreeItemColorPatchOrIcon, {
          icon: "question-circle",
        })}
        Help`}
      </TreeItem>,
      <TreeItem
        tooltipContent="Close All Session Windows"
        onSelect={async (e: Event) => {
          // @handled
          try {
            e.stopPropagation();
            await sendMessage({ type: messageTypes.closeAllSessionWindows });
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
      >
        {html`${h(TreeItemColorPatchOrIcon, {
          icon: "x-circle",
        })}
        Close All Session Windows`}
      </TreeItem>,
      !_currentSessionData ? null : (
        <TreeItem
          tooltipContent="Exit Current Session"
          onSelect={async (e: Event) => {
            // @handled
            try {
              e.stopPropagation();
              await openNewSession(null);
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        >
          {html`${h(TreeItemColorPatchOrIcon, {
            icon: "window-x",
          })}
          Exit Current Session`}
        </TreeItem>
      ),
      <TreeItem
        tooltipContent="Save Current Session"
        onSelect={async (e: Event) => {
          // @handled
          try {
            e.stopPropagation();
            await saveCurrentSessionDialogRef.value?.show();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
      >
        {html`${h(TreeItemColorPatchOrIcon, {
          icon: "window-plus",
        })}
        Save Current Session`}
      </TreeItem>,
      <TreeItem
        tooltipContent="Create Empty Session"
        onSelect={async (e: Event) => {
          // @handled
          try {
            e.stopPropagation();
            await newSessionDialogRef.value?.show();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
      >
        {html`${h(TreeItemColorPatchOrIcon, {
          icon: "window-plus",
        })}
        Create Empty Session`}
      </TreeItem>,
    );

    return sessionsTreeContent;
  } catch (error) {
    console.error(error);

    return fallbackTreeContent();
  }
}
