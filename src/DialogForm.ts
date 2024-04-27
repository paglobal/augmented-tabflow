import { h } from "promethium-js";
import { TemplateResult, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import { Dialog } from "./Dialog";
import { serialize } from "@shoelace-style/shoelace/dist/utilities/form.js";

export function DialogForm(props: {
  dialogLabel: string;
  dialogRef: Ref<SlDialog>;
  formContent: TemplateResult;
  submitButtonText: string;
  formAction: (data: any) => void;
}) {
  const formRef = createRef<HTMLFormElement>();

  return () => html`
    ${h(Dialog, {
      label: props.dialogLabel,
      content: html`
        <form
          ${ref(formRef)}
          class="dialog-form"
          @submit=${(e: Event) => {
            // @error
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
          }}
        >
          ${props.formContent}
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
        </form>
      `,
      ref: props.dialogRef,
    })}
  `;
}
