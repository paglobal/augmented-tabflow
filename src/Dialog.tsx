import { html } from "lit";
import { Ref, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
import { SlDialog, SlRequestCloseEvent } from "@shoelace-style/shoelace";
import { PromethiumNode } from "promethium-js";

export function Dialog(props: {
  label: string;
  children: PromethiumNode;
  ref: Ref<SlDialog>;
  fullWidth?: boolean;
  noTopBodyMargin?: boolean;
  onAfterShow?: () => void;
  onAfterHide?: () => void;
  onHide?: () => void;
  open?: boolean;
  preventClosing?: boolean;
  preventClosingWithEscape?: boolean;
}) {
  const bodyMargins = {
    top: props.noTopBodyMargin ? "0" : "1rem",
    right: props.fullWidth ? "1rem" : "2rem",
    left: props.fullWidth ? "1rem" : "2rem",
    bottom: "1rem",
  };

  return () => html`
    <sl-dialog
      ${ref(props.ref)}
      ?open=${props.open}
      .noHeader=${props.preventClosing ? true : false}
      label=${props.label}
      style=${styleMap({
        fontSize: "1rem",
        color: "var(--sl-color-neutral-800)",
        "--header-spacing": "1rem",
        "--body-spacing": `${bodyMargins.top} ${bodyMargins.right} ${bodyMargins.bottom} ${bodyMargins.left}`,
        "--width": "min(800px, 90%)",
      })}
      @sl-after-show=${props.onAfterShow}
      @sl-after-hide=${() => {
        props.onAfterHide?.();
        document.addEventListener(
          "focusin",
          () => {
            (document.activeElement as HTMLElement)?.blur();
          },
          { once: true },
        );
      }}
      @sl-hide=${props.onHide}
      @sl-request-close=${(e: SlRequestCloseEvent) => {
        if (props.preventClosing && e.detail.source === "overlay") {
          e.preventDefault();
        }
        if (props.preventClosingWithEscape) {
          e.preventDefault();
        }
      }}
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
