import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import {
  currentSessionData,
  deleteSession,
  groupUngroupedTabsInWindow,
} from "./sessionService";
import { notify } from "./utils";
import { getStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";
import {
  helpDialogRef,
  addTabGroupDialogRef,
  newSessionDialogRef,
  editSessionInputRef,
  editSessionDialogRef,
  tabGroupTreeDialogRef,
} from "./App";

export function Toolbar() {
  async function tabGroupTreeButton() {
    const _currentSessionData = await currentSessionData();

    return _currentSessionData
      ? null
      : html`<sl-icon-button
          name="list-ul"
          title="Show Tab Group Tree"
          @click=${() => tabGroupTreeDialogRef.value?.show()}
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
        <sl-icon-button
          name="arrow-left"
          title="Go Back One Page In Current Tab"
          @click=${() => {
            chrome.tabs.goBack();
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-right"
          title="Go Forward One Page In Current Tab"
          @click=${() => {
            chrome.tabs.goForward();
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-clockwise"
          title="Reload Current Tab"
          @click=${() => {
            chrome.tabs.reload();
          }}
        ></sl-icon-button>
        ${until(tabGroupTreeButton(), null)}
        <sl-icon-button
          name="plus-circle"
          title="Add Tab Group"
          @click=${() => addTabGroupDialogRef.value?.show()}
        ></sl-icon-button>
        <sl-icon-button
          name="stickies"
          title="Group Ungrouped Tabs In This Window"
          @click=${groupUngroupedTabsInWindow}
        ></sl-icon-button>
        <sl-icon-button
          name="window-plus"
          title="Create Empty Session"
          @click=${() => newSessionDialogRef.value?.show()}
        ></sl-icon-button>
        <sl-icon-button
          name="pen"
          title="Edit Current Session Title"
          @click=${async () => {
            if (editSessionInputRef.value) {
              const currentSessionData =
                await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
                  sessionStorageKeys.currentSessionData,
                );
              if (currentSessionData) {
                editSessionDialogRef.value?.show();
                setTimeout(() => {
                  if (editSessionInputRef.value) {
                    editSessionInputRef.value.value = currentSessionData.title;
                  }
                });
              } else {
                notify("Current session is unsaved", "warning");
              }
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="trash"
          title="Delete Current Session"
          @click=${async () => {
            const currentSessionData =
              await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
                sessionStorageKeys.currentSessionData,
              );
            if (currentSessionData) {
              deleteSession(currentSessionData.id, true);
            } else {
              notify("Current session is unsaved", "warning");
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="question-circle"
          title="Help"
          @click=${() => helpDialogRef.value?.show()}
        ></sl-icon-button>
      </sl-button-group>
    </div>`;
}
