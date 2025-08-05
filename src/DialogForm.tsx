import { PromethiumNode } from "promethium-js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { SlDialog } from "@shoelace-style/shoelace";
import { Dialog } from "./Dialog";
import { serialize } from "@shoelace-style/shoelace/dist/utilities/form.js";

export function DialogForm(props: {
  dialogLabel: string;
  dialogRef: Ref<SlDialog>;
  children: PromethiumNode;
  submitButtonText: string;
  formAction: (data: any) => void;
  errorFn: (e: SubmitEvent) => void;
}) {
  const formRef = createRef<HTMLFormElement>();

  return () => (
    <Dialog label={props.dialogLabel} ref={props.dialogRef}>
      <form
        use:ref={ref(formRef)}
        class="dialog-form"
        on:submit={async (e) => {
          // @handled
          try {
            e.preventDefault();
            if (formRef.value) {
              const data = serialize(formRef.value);
              props.formAction(data);
            }
            formRef.value?.reset();
            await props.dialogRef.value?.hide();
          } catch (error) {
            console.error(error);
            props.errorFn(e);
          }
        }}
      >
        {props.children}
        <sl-button
          type="submit"
          $attr:style={styleMap({
            display: "block",
            fontSize: "1rem",
            marginTop: "3rem",
          })}
          variant="primary"
        >
          {props.submitButtonText}
        </sl-button>
      </form>
    </Dialog>
  );
}
