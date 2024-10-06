import { html } from "lit";
import { Ref, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
import { SlDialog } from "@shoelace-style/shoelace";
import { PromethiumNode } from "promethium-js";

export function Dialog(props: {
  label: string;
  children: PromethiumNode;
  ref: Ref<SlDialog>;
  fullWidth?: boolean;
  noTopBodyMargin?: boolean;
  onAfterShow?: () => void;
  onAfterHide?: () => void;
}) {
  const bodyMargins = {
    top: props.noTopBodyMargin ? "0" : "1rem",
    right: props.fullWidth ? "1rem" : "2rem",
    left: props.fullWidth ? "1rem" : "2rem",
    bottom: "1rem",
  };

  return () => html`
    <sl-dialog
      label=${props.label}
      ${ref(props.ref)}
      style=${styleMap({
        fontSize: "1rem",
        color: "var(--sl-color-neutral-800)",
        "--header-spacing": "1rem",
        "--body-spacing": `${bodyMargins.top} ${bodyMargins.right} ${bodyMargins.bottom} ${bodyMargins.left}`,
      })}
      @sl-hide=${() =>
        document.addEventListener(
          "focusin",
          () => {
            (document.activeElement as HTMLElement)?.blur();
          },
          { once: true },
        )}
      @sl-after-show=${props.onAfterShow}
      @sl-after-hide=${props.onAfterHide}
    >
      <div
        style=${styleMap({
          paddingBottom: "0.8rem",
        })}
      >
        ${props.children}
      </div>
    </sl-dialog>
  `;
}
