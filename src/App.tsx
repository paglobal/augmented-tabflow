import { adaptState } from "promethium-js";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { until } from "lit/directives/until.js";
import { createRef, ref } from "lit/directives/ref.js";
import { setDefaultAnimation } from "@shoelace-style/shoelace/dist/utilities/animation-registry.js";
import { SlDialog, SlInput, SlSelect } from "@shoelace-style/shoelace";
import { Toolbar } from "./Toolbar";
import { Help } from "./Help";
import { Dialog } from "./Dialog";
import { SessionSwitcher } from "./SessionSwitcher";
import { DialogForm } from "./DialogForm";
import { Tree } from "./Tree";
import { NavigateDialog } from "./NavigateDialog";
import { tabGroupColors, notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  createSession,
  updateTabGroup,
  updateSessionTitle,
  deleteSession,
} from "./sessionService";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
import { moveOrCopyToSessionTreeContent } from "./moveOrCopyToSessionTreeContent";
import { sessionWindowsTreeContent } from "./sessionWindowsTreeContent";
import { TabGroupTreeData } from "../sharedUtils";
import { importTabGroupFromSessionTreeContent } from "./importTabGroupFromSessionTreeContent";
import promiseWithOneTimeFallback from "./promiseWithOneTimeFallback";
import { SessionView } from "./SessionView";

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
export const newSessionDialogRef = createRef<SlDialog>();
export const editSessionDialogRef = createRef<SlDialog>();
export const editSessionInputRef = createRef<SlInput>();
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
                <SessionSwitcher />
                <Toolbar />
                <SessionView />
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
                  formAction={async (data: {
                    title: chrome.tabGroups.TabGroup["title"];
                    color: chrome.tabGroups.Color;
                  }) => {
                    // @handled
                    try {
                      await updateTabGroup(currentlyEditedTabGroupId(), data);
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
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
                  dialogLabel="Save Current Session"
                  dialogRef={saveCurrentSessionDialogRef}
                  submitButtonText="Save"
                  formAction={({ title }: { title: string }) => {
                    // @maybe
                    try {
                      createSession(title, true);
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
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
                  formAction={async ({ title }: { title: string }) => {
                    // @handled
                    try {
                      await createSession(title);
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
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
                    // @handled
                    try {
                      const _currentlyEditedSessionId =
                        currentlyEditedSessionId() ?? true;
                      await updateSessionTitle(
                        _currentlyEditedSessionId,
                        title,
                      );
                      setCurrentlyEditedSessionId(null);
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
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
                        @click=${async () => {
                          // @handled
                          try {
                            const _currentlyDeletedSessionId =
                              currentlyDeletedSessionId();
                            if (_currentlyDeletedSessionId) {
                              await deleteSession(
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
                <NavigateDialog />
              </>
            )}
          </div>
        </div>
      </div>
    </div>`;
}
