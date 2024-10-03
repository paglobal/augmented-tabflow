import { adaptState } from "promethium-js";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
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
import "@shoelace-style/shoelace/dist/components/popup/popup.js";
import "@shoelace-style/shoelace/dist/components/menu/menu.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js";
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
import { sessionsTreeContent } from "./sessionsTreeContent";
import { moveOrCopyToSessionTreeContent } from "./moveOrCopyToSessionTreeContent";
import { sessionWindowsTreeContent } from "./sessionWindowsTreeContent";
import { TabGroupTreeData } from "../sharedUtils";
import { importTabGroupFromSessionTreeContent } from "./importTabGroupFromSessionTreeContent";
import promiseWithOneTimeFallback from "./promiseWithOneTimeFallback";
import { tabGroupTreeContent } from "./tabGroupTreeContent";

// disable animations for all tree items
setDefaultAnimation("tree-item.expand", null);
setDefaultAnimation("tree-item.collapse", null);

export const editTabGroupDialogRefs = {
  dialog: createRef<SlDialog>(),
  input: createRef<SlInput>(),
  select: createRef<SlSelect>(),
};
export const navigateInputRef = createRef<SlInput>();

export const helpDialogRef = createRef<SlDialog>();
export const saveCurrentSessionDialogRef = createRef<SlDialog>();
export const addTabGroupDialogRef = createRef<SlDialog>();
export const addTabGroupSelectRef = createRef<SlSelect>();
export const newSessionDialogRef = createRef<SlDialog>();
export const editSessionDialogRef = createRef<SlDialog>();
export const editSessionInputRef = createRef<SlInput>();
export const sessionsTreeDialogRef = createRef<SlDialog>();
export const deleteSessionDialogRef = createRef<SlDialog>();
export const moveOrCopyTabToSessionTreeDialogRef = createRef<SlDialog>();
export const moveOrCopyTabGroupToSessionTreeDialogRef = createRef<SlDialog>();
export const sessionWindowsTreeDialogRef = createRef<SlDialog>();
export const importTabGroupFromSessionTreeDialogRef = createRef<SlDialog>();
export const navigateDialogRef = createRef<SlDialog>();

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
export const [currentlyNavigatedTabId, setCurrentlyNavigatedTabId] = adaptState<
  chrome.tabs.Tab["id"] | null
>(null);
export const [navigationDropdownActive, setNavigationDropdownActive] =
  adaptState<boolean>(false);

export function App() {
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
            ${(
              <>
                <SessionIndicator />
                <Toolbar />
                <Tree contentFn={tabGroupTreeContent} fullHeight></Tree>
                <Dialog
                  label="Sessions"
                  ref={sessionsTreeDialogRef}
                  fullWidth
                  noTopBodyMargin
                >
                  <Tree contentFn={sessionsTreeContent} />
                </Dialog>
                <Dialog
                  label="Move To Window"
                  ref={sessionWindowsTreeDialogRef}
                  fullWidth
                  noTopBodyMargin
                >
                  <Tree
                    contentFn={() =>
                      promiseWithOneTimeFallback(
                        sessionWindowsTreeContent(),
                        fallbackTreeContent(),
                      )
                    }
                  />
                </Dialog>
                <Dialog
                  label="Import Tab Group"
                  ref={importTabGroupFromSessionTreeDialogRef}
                  fullWidth
                  noTopBodyMargin
                >
                  <Tree
                    contentFn={() =>
                      promiseWithOneTimeFallback(
                        importTabGroupFromSessionTreeContent(),
                        fallbackTreeContent(),
                      )
                    }
                  />
                </Dialog>
                <Dialog
                  label="Move Or Copy Tab To Session"
                  ref={moveOrCopyTabToSessionTreeDialogRef}
                  fullWidth
                  noTopBodyMargin
                >
                  <Tree
                    contentFn={() =>
                      until(
                        moveOrCopyToSessionTreeContent("tab"),
                        fallbackTreeContent(),
                      )
                    }
                  />
                </Dialog>
                <Dialog
                  label="Move Or Copy Tab Group To Session"
                  ref={moveOrCopyTabGroupToSessionTreeDialogRef}
                  fullWidth
                  noTopBodyMargin
                >
                  <Tree
                    contentFn={() =>
                      until(
                        moveOrCopyToSessionTreeContent("tabGroup"),
                        fallbackTreeContent(),
                      )
                    }
                  />
                </Dialog>
                <Dialog label="Help" ref={helpDialogRef} noTopBodyMargin>
                  <Help />
                </Dialog>
                <DialogForm
                  dialogLabel="Edit Tab Group"
                  dialogRef={editTabGroupDialogRefs.dialog}
                  submitButtonText="Save"
                  formAction={(data: {
                    title: chrome.tabGroups.TabGroup["title"];
                    color: chrome.tabGroups.Color;
                  }) => {
                    // @maybe
                    updateTabGroup(currentlyEditedTabGroupId(), data);
                  }}
                >
                  {html`
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
                  `}
                </DialogForm>
                <DialogForm
                  dialogLabel="Add Tab Group"
                  dialogRef={addTabGroupDialogRef}
                  submitButtonText="Save"
                  formAction={async (data: {
                    title: chrome.tabGroups.TabGroup["title"];
                    color: chrome.tabGroups.Color;
                  }) => {
                    // @maybe
                    if (!data.color) {
                      data.color = randomTabGroupColorValue();
                    }
                    createTabGroup(data);
                  }}
                >
                  {html`
                    <sl-input
                      name="title"
                      placeholder="Title"
                      autofocus
                    ></sl-input>
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
                  `}
                </DialogForm>
                <DialogForm
                  dialogLabel="Save Current Session"
                  dialogRef={saveCurrentSessionDialogRef}
                  submitButtonText="Save"
                  formAction={({ title }: { title: string }) => {
                    // @maybe
                    createSession(title, true);
                  }}
                >
                  {html`
                    <sl-input
                      name="title"
                      placeholder="Title"
                      autofocus
                    ></sl-input>
                  `}
                </DialogForm>
                <DialogForm
                  dialogLabel="Create Empty Session"
                  dialogRef={newSessionDialogRef}
                  submitButtonText="Save"
                  formAction={({ title }: { title: string }) => {
                    // @maybe
                    createSession(title);
                  }}
                >
                  {html`
                    <sl-input
                      name="title"
                      placeholder="Title"
                      autofocus
                    ></sl-input>
                  `}
                </DialogForm>
                <DialogForm
                  dialogLabel="Edit Session Title"
                  dialogRef={editSessionDialogRef}
                  submitButtonText="Save"
                  formAction={async ({ title }: { title: string }) => {
                    // @maybe
                    const _currentlyEditedSessionId =
                      currentlyEditedSessionId() ?? true;
                    await updateSessionTitle(_currentlyEditedSessionId, title);
                    setCurrentlyEditedSessionId(null);
                  }}
                >
                  {html`
                    <sl-input
                      ${ref(editSessionInputRef)}
                      name="title"
                      placeholder="Title"
                      autofocus
                    ></sl-input>
                  `}
                </DialogForm>
                <Dialog
                  label="Delete Session?"
                  ref={deleteSessionDialogRef}
                  fullWidth
                  noTopBodyMargin
                >
                  {html`
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
                        @click=${async () => {
                          // @handled
                          try {
                            await deleteSessionDialogRef.value?.hide();
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
                  `}
                </Dialog>
                <Dialog
                  label="Navigate"
                  ref={navigateDialogRef}
                  noTopBodyMargin
                >
                  {html`
                    <sl-button-group
                      label="Navigation Tools"
                      style=${styleMap({
                        fontSize: "1rem",
                        paddingTop: "0.25rem",
                        paddingBottom: "0.5rem",
                        display: "flex",
                        justifyContent: "center",
                      })}
                    >
                      <sl-icon-button
                        name="arrow-left"
                        title="Go Back"
                        @click=${async () => {
                          // @handled
                          try {
                            const _currentyNavigatedTabId =
                              currentlyNavigatedTabId();
                            if (_currentyNavigatedTabId) {
                              await chrome.tabs.goBack(_currentyNavigatedTabId);
                            }
                          } catch (error) {
                            console.error(error);
                            notifyWithErrorMessageAndReloadButton();
                          }
                        }}
                      ></sl-icon-button>
                      <sl-icon-button
                        name="arrow-right"
                        title="Go Forward"
                        @click=${async () => {
                          // @handled
                          try {
                            const _currentyNavigatedTabId =
                              currentlyNavigatedTabId();
                            if (_currentyNavigatedTabId) {
                              await chrome.tabs.goForward(
                                _currentyNavigatedTabId,
                              );
                            }
                          } catch (error) {
                            console.error(error);
                            notifyWithErrorMessageAndReloadButton();
                          }
                        }}
                      ></sl-icon-button>
                      <sl-icon-button
                        name="arrow-clockwise"
                        title="Reload Page"
                        @click=${async () => {
                          // @handled
                          try {
                            const _currentyNavigatedTabId =
                              currentlyNavigatedTabId();
                            if (_currentyNavigatedTabId) {
                              await chrome.tabs.reload(_currentyNavigatedTabId);
                            }
                          } catch (error) {
                            console.error(error);
                            notifyWithErrorMessageAndReloadButton();
                          }
                        }}
                      ></sl-icon-button>
                    </sl-button-group>
                    <sl-popup placement="bottom" sync="width">
                      <sl-input
                        ${ref(navigateInputRef)}
                        slot="anchor"
                        placeholder="Search"
                        autofocus
                      ></sl-input>
                      <sl-menu>
                        <sl-menu-item>Option 1</sl-menu-item>
                        <sl-menu-item disabled>Option 2</sl-menu-item>
                        <sl-menu-item>Option 3</sl-menu-item>
                      </sl-menu>
                    </sl-popup>
                  `}
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </div>`;
}
