import { html } from "lit";
import { h } from "promethium-js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.js";
import { Help } from "./Help";
import { Dialog } from "./Dialog";
import {
  createSession,
  createTabGroup,
  deleteCurrentSession,
  groupUngroupedTabsInWindow,
  updateCurrentSession,
} from "./sessionService";
import { DialogForm } from "./DialogForm";
import { tabGroupColors } from "./utils";
import { getStorageData } from "../sharedUtils";
import { areaNames, sessionStorageKeys } from "../constants";

export function Toolbar() {
  const helpDialogRef = createRef<SlDialog>();
  const addTabGroupDialogRef = createRef<SlDialog>();
  const newSessionDialogRef = createRef<SlDialog>();
  const editSessionDialogRef = createRef<SlDialog>();
  const editSessionInputRef = createRef<SlInput>();

  function randomTabGroupColorValue() {
    const tabGroupColorNames = Object.keys(tabGroupColors());

    return tabGroupColorNames[
      Math.floor(Math.random() * tabGroupColorNames.length)
    ] as chrome.tabGroups.Color;
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
        <sl-icon-button
          name="plus-circle"
          title="Add Tab Group"
          @click=${() => addTabGroupDialogRef.value?.show()}
        ></sl-icon-button>
        ${h(DialogForm, {
          dialogLabel: "Add Tab Group",
          dialogRef: addTabGroupDialogRef,
          formContent: html`
            <sl-input name="title" placeholder="Title" autofocus></sl-input>
            <sl-select name="color" placeholder="Color" hoist>
              ${Object.entries(tabGroupColors()).map(
                ([colorName, colorValue]) => html`
                  <sl-option value=${colorName}
                    ><div></div>
                    <span
                      slot="prefix"
                      style=${styleMap({
                        background: colorValue,
                        width: "0.8rem",
                        height: "0.8rem",
                        marginRight: "1rem",
                        borderRadius: "50%",
                        outline: "0.15rem solid var(--sl-color-neutral-1000)",
                        outlineOffset: "0.15rem",
                      })}
                    ></span
                    >${colorName}</sl-option
                  >
                `,
              )}
            </sl-select>
          `,
          submitButtonText: "Save",
          async formAction(data: {
            title: chrome.tabGroups.TabGroup["title"];
            color: chrome.tabGroups.Color;
          }) {
            if (!data.color) {
              data.color = randomTabGroupColorValue();
            }
            createTabGroup(data);
          },
        })}
        <sl-icon-button
          name="stickies"
          title="Group Ungrouped Tabs In this Window"
          @click=${groupUngroupedTabsInWindow}
        ></sl-icon-button>
        <sl-icon-button
          name="window-plus"
          title="New Session"
          @click=${() => newSessionDialogRef.value?.show()}
        ></sl-icon-button>
        ${h(DialogForm, {
          dialogLabel: "New Session",
          dialogRef: newSessionDialogRef,
          formContent: html`
            <sl-input name="title" placeholder="Title" autofocus></sl-input>
          `,
          submitButtonText: "Save",
          formAction({ title }: { title: string }) {
            createSession(title);
          },
        })}
        <sl-icon-button
          name="pen"
          title="Edit Session"
          @click=${async () => {
            editSessionDialogRef.value?.show();
            if (editSessionInputRef.value) {
              const currentSession = await getStorageData(
                areaNames.session,
                sessionStorageKeys.currentSession,
              );
              editSessionInputRef.value.value = currentSession;
            }
          }}
        ></sl-icon-button>
        ${h(DialogForm, {
          dialogLabel: "Edit Session",
          dialogRef: editSessionDialogRef,
          formContent: html`
            <sl-input
              ${ref(editSessionInputRef)}
              name="title"
              placeholder="Title"
              autofocus
            ></sl-input>
          `,
          submitButtonText: "Save",
          formAction({ title }: { title: string }) {
            updateCurrentSession(title);
          },
        })}
        <sl-icon-button
          name="trash"
          title="Delete Session"
          @click=${deleteCurrentSession}
        ></sl-icon-button>
        <sl-icon-button
          name="question-circle"
          title="Help"
          @click=${() => helpDialogRef.value?.show()}
        ></sl-icon-button>
        ${h(Dialog, {
          label: "Help",
          content: html`${h(Help)}`,
          ref: helpDialogRef,
        })}
      </sl-button-group>
    </div>`;
}
