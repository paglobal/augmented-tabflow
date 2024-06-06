import { adaptState, h } from "promethium-js";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref } from "lit/directives/ref.js";
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
import { SessionIndicator } from "./SessionIndicator";
import { DialogForm } from "./DialogForm";
import { Tree } from "./Tree";
import {
  tabGroupColors,
  randomTabGroupColorValue,
  notifyWithErrorMessageAndReloadButton,
} from "./utils";
import {
  createSession,
  updateTabGroup,
  updateSessionTitle,
  createTabGroup,
  deleteSession,
} from "./sessionService";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { moveOrCopyToSessionTreeContent } from "./moveOrCopyToSessionTreeContent";
import { sessionWindowsTreeContent } from "./sessionWindowsTreeContent";
import { TabGroupTreeData } from "../sharedUtils";
import { importTabGroupFromSessionTreeContent } from "./importTabGroupFromSessionTreeContent";
import promiseWithOneTimeFallback from "./promiseWithOneTimeFallback";

// disable animations for all tree items
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
export const addTabGroupSelectRef = createRef<SlSelect>();
export const newSessionDialogRef = createRef<SlDialog>();
export const editSessionDialogRef = createRef<SlDialog>();
export const editSessionInputRef = createRef<SlInput>();
export const tabGroupTreeDialogRef = createRef<SlDialog>();
export const sessionsTreeDialogRef = createRef<SlDialog>();
export const deleteSessionDialogRef = createRef<SlDialog>();
export const moveOrCopyTabToSessionTreeDialogRef = createRef<SlDialog>();
export const moveOrCopyTabGroupToSessionTreeDialogRef = createRef<SlDialog>();
export const sessionWindowsTreeDialogRef = createRef<SlDialog>();
export const importTabGroupFromSessionTreeDialogRef = createRef<SlDialog>();

export const [currentlyEditedTabGroupId, setCurrentlyEditedTabGroupId] =
  adaptState<chrome.tabGroups.TabGroup["id"] | null>(null);
export const [currentlyEditedSessionId, setCurrentlyEditedSessionId] =
  adaptState<chrome.bookmarks.BookmarkTreeNode["id"] | null>(null);
export const [currentlyDeletedSessionId, setCurrentlyDeletedSessionId] =
  adaptState<chrome.bookmarks.BookmarkTreeNode["id"] | null>(null);
export const [
  currentlyDeletedSessionIsCurrentSession,
  setCurrentlyDeletedSessionIsCurrentSession,
] = adaptState<boolean>(false);
export const [
  currentlyMovedOrCopiedTabOrTabGroup,
  setCurrentMovedOrCopiedTabOrTabGroup,
] = adaptState<chrome.tabs.Tab | TabGroupTreeData[number] | null>(null);
export const [currentlyEjectedTabOrTabGroup, setCurrentlyEjectedTabOrTabGroup] =
  adaptState<chrome.tabs.Tab | TabGroupTreeData[number] | null>(null);
export const [firstTabInNewTabGroup, setFirstTabInNewTabGroup] =
  adaptState<chrome.tabs.Tab | null>(null);

export function App() {
  function mainAppView() {
    return html`<div
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
            ${h(SessionIndicator)} ${h(Toolbar)} ${h(SessionView)}
            ${h(Dialog, {
              label: "Sessions",
              content: html`${h(Tree, {
                contentFn: sessionsTreeContent,
              })}`,
              ref: sessionsTreeDialogRef,
              fullWidth: true,
              noTopBodyMargin: true,
            })}
            ${h(Dialog, {
              label: "Tab Group Tree",
              content: html`${h(Tree, {
                contentFn: tabGroupTreeContent,
              })}`,
              fullWidth: true,
              noTopBodyMargin: true,
              ref: tabGroupTreeDialogRef,
            })}
            ${h(Dialog, {
              label: "Move To Window",
              content: html`${h(Tree, {
                contentFn: () =>
                  promiseWithOneTimeFallback(
                    sessionWindowsTreeContent(),
                    fallbackTreeContent(),
                  ),
              })}`,
              fullWidth: true,
              noTopBodyMargin: true,
              ref: sessionWindowsTreeDialogRef,
            })}
            ${h(Dialog, {
              label: "Import Tab Group",
              content: html`${h(Tree, {
                contentFn: () =>
                  promiseWithOneTimeFallback(
                    importTabGroupFromSessionTreeContent(),
                    fallbackTreeContent(),
                  ),
              })}`,
              fullWidth: true,
              noTopBodyMargin: true,
              ref: importTabGroupFromSessionTreeDialogRef,
            })}
            ${h(Dialog, {
              label: "Move Or Copy Tab To Session",
              content: html`${h(Tree, {
                contentFn: () =>
                  promiseWithOneTimeFallback(
                    moveOrCopyToSessionTreeContent("tab"),
                    fallbackTreeContent(),
                  ),
              })}`,
              fullWidth: true,
              noTopBodyMargin: true,
              ref: moveOrCopyTabToSessionTreeDialogRef,
            })}
            ${h(Dialog, {
              label: "Move Or Copy Tab Group To Session",
              content: html`${h(Tree, {
                contentFn: () =>
                  promiseWithOneTimeFallback(
                    moveOrCopyToSessionTreeContent("tabGroup"),
                    fallbackTreeContent(),
                  ),
              })}`,
              fullWidth: true,
              noTopBodyMargin: true,
              ref: moveOrCopyTabGroupToSessionTreeDialogRef,
            })}
            ${h(Dialog, {
              label: "Help",
              content: html`${h(Help)}`,
              ref: helpDialogRef,
              noTopBodyMargin: true,
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
                // @maybe
                updateTabGroup(currentlyEditedTabGroupId(), data);
              },
            })}
            ${h(DialogForm, {
              dialogLabel: "Add Tab Group",
              dialogRef: addTabGroupDialogRef,
              formContent: html`
                <sl-input name="title" placeholder="Title" autofocus></sl-input>
                <sl-select
                  ${ref(addTabGroupSelectRef)}
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
              submitButtonText: "Save",
              async formAction(data: {
                title: chrome.tabGroups.TabGroup["title"];
                color: chrome.tabGroups.Color;
              }) {
                // @maybe
                if (!data.color) {
                  data.color = randomTabGroupColorValue();
                }
                createTabGroup(data);
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
                // @maybe
                createSession(title, true);
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
                // @maybe
                createSession(title);
              },
            })}
            ${h(DialogForm, {
              dialogLabel: "Edit Session Title",
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
              async formAction({ title }: { title: string }) {
                // @maybe
                const _currentlyEditedSessionId =
                  currentlyEditedSessionId() ?? true;
                await updateSessionTitle(_currentlyEditedSessionId, title);
                setCurrentlyEditedSessionId(null);
              },
            })}
            ${h(Dialog, {
              label: "Delete Session?",
              content: html`
                <div>
                  Are you sure you want to delete session?
                  <sl-button
                    style=${styleMap({
                      display: "block",
                      fontSize: "1rem",
                      marginTop: "3rem",
                    })}
                    variant="neutral"
                    outline
                    @click=${() => {
                      // @handled
                      try {
                        deleteSessionDialogRef.value?.hide();
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                    >No</sl-button
                  >
                  <sl-button
                    style=${styleMap({
                      display: "block",
                      fontSize: "1rem",
                      marginTop: "1rem",
                    })}
                    variant="danger"
                    @click=${() => {
                      // @handled
                      try {
                        const _currentlyDeletedSessionId =
                          currentlyDeletedSessionId();
                        if (_currentlyDeletedSessionId) {
                          deleteSession(
                            _currentlyDeletedSessionId,
                            currentlyDeletedSessionIsCurrentSession(),
                          );
                        }
                        setCurrentlyDeletedSessionId(null);
                        setCurrentlyDeletedSessionIsCurrentSession(false);
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                    >Yes</sl-button
                  >
                </div>
              `,
              ref: deleteSessionDialogRef,
            })}
            ${h(Dialog, {
              label: "Help",
              content: html`${h(Help)}`,
              ref: helpDialogRef,
              noTopBodyMargin: true,
            })}
          </div>
        </div>
      </div>
    </div>`;
  }

  return () => html`${mainAppView()}`;
}
