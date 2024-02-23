import { TemplateResult, html } from "lit";
import { type Ref, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";

export function Dialog(props: {
  label: string;
  contentFn: (ref: Ref<SlDialog>) => TemplateResult;
  ref: Ref<SlDialog>;
}) {
  return () => html`
    <sl-dialog
      label=${props.label}
      ${ref(props.ref)}
      style=${styleMap({
        fontSize: "1rem",
        color: "var(--sl-color-neutral-800)",
        "--header-spacing": "1rem",
        "--body-spacing": "1rem 2rem",
      })}
    >
      <div
        style=${styleMap({
          paddingBottom: "0.8rem",
        })}
      >
        ${props.contentFn(props.ref)}
      </div>
    </sl-dialog>
  `;
}
