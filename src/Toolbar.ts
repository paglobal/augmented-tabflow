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
      <sl-button-group label="Tools">
        <sl-icon-button
          name="arrow-left"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Go Back One Page In Current Tab"
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-right"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Go Forward One Page In Current Tab"
        ></sl-icon-button>
        <sl-icon-button
          name="arrow-clockwise"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Reload Current Tab"
        ></sl-icon-button>
        <sl-icon-button
          name="plus-circle"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Add Tab Group"
        ></sl-icon-button>
        <sl-icon-button
          name="stickies"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Group Ungrouped Tabs In this Window"
        ></sl-icon-button>
        <sl-icon-button
          name="window-plus"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="New Session"
        ></sl-icon-button>
        <sl-icon-button
          name="pen"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Edit Session"
        ></sl-icon-button>
        <sl-icon-button
          name="trash"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
          title="Delete Session"
        ></sl-icon-button>
        <sl-icon-button
          name="question-circle"
          class="toolbar-icon-button"
          style=${styleMap({ fontSize: "1rem" })}
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
