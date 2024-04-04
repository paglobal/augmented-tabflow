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
import { SessionToolbar } from "./SessionToolbar";
import { tabGroupColors } from "./utils";
import { DialogForm } from "./DialogForm";
import { updateTabGroup } from "./sessionService";
import { createRootBookmarkNode } from "../sharedUtils";

// Change the default animation for all tree items
setDefaultAnimation("tree-item.expand", null);
setDefaultAnimation("tree-item.collapse", null);

export const editTabGroupDialogRefs = {
  input: createRef<SlInput>(),
  select: createRef<SlSelect>(),
};

export const [currentlyEditedTabGroupId, setCurrentlyEditedTabGroupId] =
  adaptState<chrome.tabGroups.TabGroup["id"] | null>(null);

export function App() {
  const editTabGroupDialogRef = createRef<SlDialog>();

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
            ${h(SessionToolbar)} ${h(Toolbar)}
            ${h(SessionView, { editTabGroupDialogRef })}
            <!--Dialog form is here because of layout issues when put in the \`SessionView\` component-->
            ${h(DialogForm, {
              dialogLabel: "Edit Tab Group",
              dialogRef: editTabGroupDialogRef,
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
          </div>
        </div>
      </div>
    </div>`;
}
