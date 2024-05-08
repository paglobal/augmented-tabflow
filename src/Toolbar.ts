import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import {
  currentSessionData,
  groupUngroupedTabsInWindow,
} from "./sessionService";
import { notify, notifyWithErrorMessageAndReloadButton } from "./utils";
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
} from "./App";

export function Toolbar() {
  async function tabGroupTreeButton() {
    // @handled
    try {
      const _currentSessionData = await currentSessionData();

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
                notifyWithErrorMessageAndReloadButton();
              }
            }}
          ></sl-icon-button>`;
    } catch (error) {
      notifyWithErrorMessageAndReloadButton();

      return null;
    }
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
        <sl-icon-button
          name="arrow-left"
          title="Go Back One Page In Current Tab"
          @click=${() => {
            // @handled
            try {
              chrome.tabs.goBack();
            } catch (error) {
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-right"
          title="Go Forward One Page In Current Tab"
          @click=${() => {
            // @handled
            try {
              chrome.tabs.goForward();
            } catch (error) {
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-clockwise"
          title="Reload Current Tab"
          @click=${() => {
            // @handled
            try {
              chrome.tabs.reload();
            } catch (error) {
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        ${until(tabGroupTreeButton(), null)}
        <sl-icon-button
          name="plus-circle"
          title="Add Tab Group"
          @click=${() => {
            // @handled
            try {
              addTabGroupDialogRef.value?.show();
            } catch (error) {
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
                    if (editSessionInputRef.value) {
                      editSessionInputRef.value.value =
                        currentSessionData.title;
                    }
                  });
                } else {
                  notify("Current session is unsaved", "warning");
                }
              }
            } catch (error) {
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
                notify("Current session is unsaved", "warning");
              }
            } catch (error) {
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
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
      </sl-button-group>
    </div>`;
}
