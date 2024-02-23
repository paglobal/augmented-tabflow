import { html } from "lit";
import { h } from "promethium-js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef } from "lit/directives/ref.js";
import { Help } from "./Help";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import { Dialog } from "./Dialog";

export function Toolbar(props: {
  addButtonDialogProps: Omit<Parameters<typeof Dialog>[0], "ref">;
}) {
  const addDialogRef = createRef<SlDialog>();
  const helpDialogRef = createRef<SlDialog>();

  return () =>
    html` <div
      style=${styleMap({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
      })}
    >
      <sl-button-group label="Tools">
        <sl-icon-button
          name="plus-circle"
          style=${styleMap({ fontSize: "1rem" })}
          title=${props.addButtonDialogProps.label}
          @click=${() => addDialogRef.value?.show()}
        ></sl-icon-button>
        ${h(Dialog, { ...props.addButtonDialogProps, ref: addDialogRef })}
        <sl-icon-button
          name="sort-alpha-up"
          style=${styleMap({ fontSize: "1rem" })}
          title="Sort Up"
        ></sl-icon-button>
        <sl-icon-button
          name="sort-alpha-down"
          style=${styleMap({ fontSize: "1rem" })}
          title="Sort Down"
        ></sl-icon-button>
        <sl-icon-button
          name="question-circle"
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
