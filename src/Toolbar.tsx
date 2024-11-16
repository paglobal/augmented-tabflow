import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
} from "./sessionService";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  editSessionInputRef,
  editSessionDialogRef,
  setCurrentlyDeletedSessionId,
  setCurrentlyDeletedSessionIsCurrentSession,
  deleteSessionDialogRef,
  importTabGroupFromSessionTreeDialogRef,
} from "./App";
import { createTabGroup, openNavigationBox, withError } from "../sharedUtils";
import { helpPathName } from "../constants";

export function Toolbar() {
  return () => {
    return html` <div
      style=${styleMap({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
          name="plus-lg"
          title="New Tab"
          @click=${async () => {
            // @handled
            try {
              const [error, currentTab] = await withError(
                chrome.tabs.getCurrent(),
              );
              if (error) {
                //@handle
              }
              await openNavigationBox({ precedentTabId: currentTab?.id });
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="folder-plus"
          title="New Tab Group"
          @click=${async () => {
            // @handled
            try {
              await createTabGroup();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="plus-square"
          title="New Window"
          @click=${async () => {
            // @handled
            try {
              const [error, currentTab] = await withError(
                chrome.tabs.getCurrent(),
              );
              if (error) {
                //@handle
              }
              await openNavigationBox({
                newWindow: true,
                precedentTabId: currentTab?.id,
              });
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-90deg-down"
          title="Import Tab Group"
          @click=${async () => {
            // @handled
            try {
              await importTabGroupFromSessionTreeDialogRef.value?.show();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        ${!(
          currentSessionData() &&
          currentSessionData() !== currentSessionDataNotAvailable
        )
          ? null
          : html`
              <sl-icon-button
                name="pen"
                title="Edit Current Session Title"
                @click=${async () => {
                  // @handled
                  try {
                    if (editSessionInputRef.value) {
                      const _currentSessionData = currentSessionData();
                      if (
                        _currentSessionData &&
                        _currentSessionData !== currentSessionDataNotAvailable
                      ) {
                        if (editSessionInputRef.value) {
                          editSessionInputRef.value.value =
                            _currentSessionData.title;
                          setTimeout(() => {
                            editSessionInputRef.value?.select();
                          });
                        }
                        await editSessionDialogRef.value?.show();
                      } else {
                        notifyWithErrorMessageAndReloadButton();
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
                    const _currentSessionData = currentSessionData();
                    if (
                      _currentSessionData &&
                      _currentSessionData !== currentSessionDataNotAvailable
                    ) {
                      setCurrentlyDeletedSessionId(_currentSessionData.id);
                      setCurrentlyDeletedSessionIsCurrentSession(true);
                      await deleteSessionDialogRef.value?.show();
                    } else {
                      notifyWithErrorMessageAndReloadButton();
                    }
                  } catch (error) {
                    console.error(error);
                    notifyWithErrorMessageAndReloadButton();
                  }
                }}
              ></sl-icon-button>
            `}
        <sl-icon-button
          name="aspect-ratio"
          title="Toggle Fullscreen"
          @click=${async () => {
            // @handled
            try {
              const currentWindow = await chrome.windows.getCurrent();
              if (currentWindow.id) {
                if (currentWindow.state === "fullscreen") {
                  await chrome.windows.update(currentWindow.id, {
                    state: "maximized",
                  });
                } else {
                  await chrome.windows.update(currentWindow.id, {
                    state: "fullscreen",
                  });
                }
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
          @click=${async () => {
            // @handled
            try {
              await chrome.tabs.create({ url: helpPathName });
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
      </sl-button-group>
    </div>`;
  };
}
