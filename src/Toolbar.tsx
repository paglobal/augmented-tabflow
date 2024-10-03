import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
} from "./sessionService";
import {
  notifyWithErrorMessageAndReloadButton,
  randomTabGroupColorValue,
} from "./utils";
import {
  helpDialogRef,
  addTabGroupDialogRef,
  editSessionInputRef,
  editSessionDialogRef,
  setCurrentlyDeletedSessionId,
  setCurrentlyDeletedSessionIsCurrentSession,
  deleteSessionDialogRef,
  addTabGroupSelectRef,
  importTabGroupFromSessionTreeDialogRef,
} from "./App";

export function Toolbar() {
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
          name="plus-lg"
          title="New Tab"
          @click=${async () => {
            // @handled
            try {
              await chrome.tabs.create({ active: true });
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
        <sl-icon-button
          name="plus-circle"
          title="Add Tab Group"
          @click=${async () => {
            // @handled
            try {
              if (addTabGroupSelectRef.value) {
                addTabGroupSelectRef.value.value = randomTabGroupColorValue();
              }
              await addTabGroupDialogRef.value?.show();
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
          name="fullscreen"
          title="Activate Fullscreening"
          @click=${() => {
            // @handled
            try {
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
              await helpDialogRef.value?.show();
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
      </sl-button-group>
    </div>`;
}
