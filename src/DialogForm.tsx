import { PromethiumNode, h } from "promethium-js";
import { TemplateResult, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import { Dialog } from "./Dialog";
import { serialize } from "@shoelace-style/shoelace/dist/utilities/form.js";
import { notifyWithErrorMessageAndReloadButton } from "./utils";

export function DialogForm(props: {
  dialogLabel: string;
  dialogRef: Ref<SlDialog>;
  children: PromethiumNode;
  submitButtonText: string;
  formAction: (data: any) => void;
}) {
  const formRef = createRef<HTMLFormElement>();

  return () => html`
    ${(
      <Dialog label={props.dialogLabel} ref={props.dialogRef}>
        {html`<form
          ${ref(formRef)}
          class="dialog-form"
          @submit=${(e: Event) => {
            // @handled
            try {
              e.preventDefault();
              if (formRef.value) {
                const data = serialize(formRef.value);
                props.formAction(data);
              }
              props.dialogRef.value?.hide();
              formRef.value?.reset();
              document.addEventListener(
                "focusin",
                () => {
                  (document.activeElement as HTMLElement)?.blur();
                },
                { once: true },
              );
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        >
          ${props.children}
          <sl-button
            type="submit"
            style=${styleMap({
              display: "block",
              fontSize: "1rem",
              marginTop: "3rem",
            })}
            variant="primary"
            >${props.submitButtonText}</sl-button
          >
        </form> `}
      </Dialog>
    )}
  `;
}
