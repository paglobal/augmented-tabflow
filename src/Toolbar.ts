import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import {
  currentSessionData,
  groupUngroupedTabsInWindow,
} from "./sessionService";
import {
  notify,
  notifyWithErrorMessageAndReloadButton,
  randomTabGroupColorValue,
} from "./utils";
import { getStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";
import {
  helpDialogRef,
  addTabGroupDialogRef,
  newSessionDialogRef,
  editSessionInputRef,
  editSessionDialogRef,
  tabGroupTreeDialogRef,
  setCurrentlyDeletedSessionId,
  setCurrentlyDeletedSessionIsCurrentSession,
  deleteSessionDialogRef,
  addTabGroupSelectRef,
} from "./App";

export function Toolbar() {
  function tabGroupTreeButton() {
    const _currentSessionData = currentSessionData();
    return _currentSessionData
      ? null
      : html`<sl-icon-button
          name="list-ul"
          title="Show Tab Group Tree"
          @click=${() => {
            // @handled
            try {
              tabGroupTreeDialogRef.value?.show();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>`;
  }

  return () =>
    html` <div
      style=${styleMap({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5rem",
      })}
    >
      <sl-button-group
        label="Tools"
        style=${styleMap({
          fontSize: "1rem",
          paddingTop: "0.5rem",
          paddingBottom: "0.75rem",
        })}
      >
        ${tabGroupTreeButton()}
        <sl-icon-button
          name="plus-circle"
          title="Add Tab Group"
          @click=${() => {
            // @handled
            try {
              if (addTabGroupSelectRef.value) {
                addTabGroupSelectRef.value.value = randomTabGroupColorValue();
              }
              addTabGroupDialogRef.value?.show();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="stickies"
          title="Group Ungrouped Tabs In This Window"
          @click=${() => {
            // @handled
            try {
              groupUngroupedTabsInWindow();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="window-plus"
          title="Create Empty Session"
          @click=${() => {
            // @handled
            try {
              newSessionDialogRef.value?.show();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="pen"
          title="Edit Current Session Title"
          @click=${async () => {
            // @handled
            try {
              if (editSessionInputRef.value) {
                const currentSessionData =
                  await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
                    sessionStorageKeys.currentSessionData,
                  );
                if (currentSessionData) {
                  editSessionDialogRef.value?.show();
                  setTimeout(() => {
                    // @handled
                    try {
                      if (editSessionInputRef.value) {
                        editSessionInputRef.value.value =
                          currentSessionData.title;
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  });
                } else {
                  notify("Current session is unsaved.", "warning");
                }
              }
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="trash"
          title="Delete Current Session"
          @click=${async () => {
            // @handled
            try {
              const currentSessionData =
                await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
                  sessionStorageKeys.currentSessionData,
                );
              if (currentSessionData) {
                setCurrentlyDeletedSessionId(currentSessionData.id);
                setCurrentlyDeletedSessionIsCurrentSession(true);
                deleteSessionDialogRef.value?.show();
              } else {
                notify("Current session is unsaved.", "warning");
              }
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="question-circle"
          title="Help"
          @click=${() => {
            // @handled
            try {
              helpDialogRef.value?.show();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
      </sl-button-group>
    </div>`;
}
