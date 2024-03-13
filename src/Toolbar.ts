import { html } from "lit";
import { h } from "promethium-js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef } from "lit/directives/ref.js";
import { Help } from "./Help";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import { Dialog } from "./Dialog";

export function Toolbar() {
  const helpDialogRef = createRef<SlDialog>();

  return () =>
    html` <div
      style=${styleMap({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5rem",
      })}
    >
      <sl-button-group label="Tools" style=${styleMap({ fontSize: "1rem" })}>
        <sl-icon-button
          name="arrow-left"
          title="Go Back One Page In Current Tab"
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-right"
          title="Go Forward One Page In Current Tab"
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-clockwise"
          title="Reload Current Tab"
        ></sl-icon-button>
        <sl-icon-button
          name="plus-circle"
          title="Add Tab Group"
        ></sl-icon-button>
        <sl-icon-button
          name="stickies"
          title="Group Ungrouped Tabs In this Window"
        ></sl-icon-button>
        <sl-icon-button name="window-plus" title="New Session"></sl-icon-button>
        <sl-icon-button name="pen" title="Edit Session"></sl-icon-button>
        <sl-icon-button name="trash" title="Delete Session"></sl-icon-button>
        <sl-icon-button
          name="question-circle"
          title="Help"
          @click=${() => helpDialogRef.value?.show()}
        ></sl-icon-button>
        ${h(Dialog, {
          label: "Help",
          contentFn: () => html`${h(Help)}`,
          ref: helpDialogRef,
        })}
      </sl-button-group>
    </div>`;
}
