import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { openNewSession, sessionsTreeData } from "./sessionService";
import {
  deleteSessionDialogRef,
  editSessionDialogRef,
  editSessionInputRef,
  helpDialogRef,
  saveCurrentSessionDialogRef,
  setCurrentlyDeletedSessionId,
  setCurrentlyDeletedSessionIsCurrentSession,
  setCurrentlyEditedSessionId,
} from "./App";
import { getStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";

export async function sessionsTreeContent() {
  // @handled
  try {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );
    const _sessionsTreeData = (await sessionsTreeData()).filter(
      (sessionData) => sessionData.id !== currentSessionData?.id,
    );
    const sessionsTreeContent = _sessionsTreeData.map((sessionData) => {
      return html`
        ${h(TreeItem, {
          tooltipContent: sessionData.title,
          async onSelect(e: Event) {
            // @handled
            try {
              e.stopPropagation();
              await openNewSession(sessionData);
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          },
          actionButtons: html`
            <sl-icon-button
              name="pen"
              title="Edit Session Title"
              @click=${async (e: Event) => {
                // @handled
                try {
                  e.stopPropagation();
                  if (editSessionInputRef.value) {
                    setCurrentlyEditedSessionId(sessionData.id);
                    editSessionDialogRef.value?.show();
                    setTimeout(() => {
                      if (editSessionInputRef.value) {
                        editSessionInputRef.value.value = sessionData.title;
                      }
                    });
                  }
                } catch (error) {
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>
            <sl-icon-button
              name="MaterialSymbolsDeleteOutlineRounded"
              class="icones-icon"
              title="Delete Session"
              @click=${async (e: Event) => {
                // @handled
                try {
                  e.stopPropagation();
                  setCurrentlyDeletedSessionId(sessionData.id);
                  setCurrentlyDeletedSessionIsCurrentSession(false);
                  deleteSessionDialogRef.value?.show();
                } catch (error) {
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>
          `,
          content: html`${h(TreeItemColorPatchOrIcon, {
            icon: "window",
          })}${sessionData.title}`,
        })}
      `;
    });
    if (currentSessionData) {
      sessionsTreeContent.unshift(
        html`${h(TreeItem, {
          content: html`${h(TreeItemColorPatchOrIcon, {
            icon: "window-x",
          })}
          Exit Current Session`,
          tooltipContent: "Exit Current Session",
          async onSelect(e: Event) {
            // @handled
            try {
              e.stopPropagation();
              await openNewSession(null);
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          },
        })}`,
      );
    }
    sessionsTreeContent?.unshift(
      html`${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "question-circle",
        })}
        Help`,
        tooltipContent: "Help",
        onSelect(e: Event) {
          // @handled
          try {
            e.stopPropagation();
            helpDialogRef.value?.show();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        },
      })}`,
      html`${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window-plus",
        })}
        Save Current Session`,
        tooltipContent: "Save Current Session",
        onSelect(e: Event) {
          // @handled
          try {
            e.stopPropagation();
            saveCurrentSessionDialogRef.value?.show();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        },
      })}`,
    );

    return sessionsTreeContent;
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();

    return fallbackTreeContent(true);
  }
}
