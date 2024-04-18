import { adaptState, h } from "promethium-js";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import { until } from "lit/directives/until.js";
import { setDefaultAnimation } from "@shoelace-style/shoelace/dist/utilities/animation-registry.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.js";
import type SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/tab-group/tab-group.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import { SessionView } from "./SessionView";
import { Toolbar } from "./Toolbar";
import { Help } from "./Help";
import { Dialog } from "./Dialog";
import { SessionToolbar } from "./SessionToolbar";
import { DialogForm } from "./DialogForm";
import { Tree } from "./Tree";
import { tabGroupColors, randomTabGroupColorValue } from "./utils";
import {
  createSession,
  updateTabGroup,
  updateCurrentSessionTitle,
  createTabGroup,
} from "./sessionService";
import { createRootBookmarkNode } from "../sharedUtils";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";

// Disable animations for all tree items
setDefaultAnimation("tree-item.expand", null);
setDefaultAnimation("tree-item.collapse", null);

export const editTabGroupDialogRefs = {
  dialog: createRef<SlDialog>(),
  input: createRef<SlInput>(),
  select: createRef<SlSelect>(),
};

export const helpDialogRef = createRef<SlDialog>();
export const saveCurrentSessionDialogRef = createRef<SlDialog>();
export const addTabGroupDialogRef = createRef<SlDialog>();
export const newSessionDialogRef = createRef<SlDialog>();
export const editSessionDialogRef = createRef<SlDialog>();
export const editSessionInputRef = createRef<SlInput>();
export const tabGroupTreeDialogRef = createRef<SlDialog>();

export const [currentlyEditedTabGroupId, setCurrentlyEditedTabGroupId] =
  adaptState<chrome.tabGroups.TabGroup["id"] | null>(null);

export function App() {
  createRootBookmarkNode();

  return () =>
    html`<div
      id="app"
      style=${styleMap({
        height: "100vh",
        overflow: "hidden",
      })}
    >
      <div
        style=${styleMap({
          width: "min(800px, 90%)",
          margin: "auto",
        })}
      >
        <div
          style=${styleMap({
            fontSize: "--sl-font-size-small",
            width: "100%",
          })}
        >
          <div
            style=${styleMap({
              display: "flex",
              flexDirection: "column",
              paddingBottom: "1.5rem",
            })}
          >
            ${h(SessionToolbar)} ${h(Toolbar)} ${h(SessionView)}
            ${h(Dialog, {
              label: "Tab Group Tree",
              content: html`${h(Tree, {
                contentFn: () =>
                  html`${until(tabGroupTreeContent(), fallbackTreeContent())}`,
              })}`,
              ref: tabGroupTreeDialogRef,
              fullWidth: true,
            })}
            ${h(Dialog, {
              label: "Help",
              content: html`${h(Help)}`,
              ref: helpDialogRef,
            })}
            ${h(DialogForm, {
              dialogLabel: "Edit Tab Group",
              dialogRef: editTabGroupDialogRefs.dialog,
              submitButtonText: "Save",
              formContent: html`
                <sl-input
                  ${ref(editTabGroupDialogRefs.input)}
                  name="title"
                  placeholder="Title"
                  autofocus
                ></sl-input>
                <sl-select
                  ${ref(editTabGroupDialogRefs.select)}
                  name="color"
                  placeholder="Color"
                  hoist
                >
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
                            outline:
                              "0.15rem solid var(--sl-color-neutral-1000)",
                            outlineOffset: "0.15rem",
                          })}
                        ></span
                        >${colorName}</sl-option
                      >
                    `,
                  )}
                </sl-select>
              `,
              formAction(data: {
                title: chrome.tabGroups.TabGroup["title"];
                color: chrome.tabGroups.Color;
              }) {
                updateTabGroup(currentlyEditedTabGroupId(), data);
              },
            })}
            ${h(DialogForm, {
              dialogLabel: "Save Current Session",
              dialogRef: saveCurrentSessionDialogRef,
              formContent: html`
                <sl-input name="title" placeholder="Title" autofocus></sl-input>
              `,
              submitButtonText: "Save",
              formAction({ title }: { title: string }) {
                createSession(title, true);
              },
            })}
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
                            outline:
                              "0.15rem solid var(--sl-color-neutral-1000)",
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
            ${h(DialogForm, {
              dialogLabel: "Create Empty Session",
              dialogRef: newSessionDialogRef,
              formContent: html`
                <sl-input name="title" placeholder="Title" autofocus></sl-input>
              `,
              submitButtonText: "Save",
              formAction({ title }: { title: string }) {
                createSession(title);
              },
            })}
            ${h(DialogForm, {
              dialogLabel: "Edit Current Session Title",
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
                updateCurrentSessionTitle(title);
              },
            })}
          </div>
        </div>
      </div>
    </div>`;
}
