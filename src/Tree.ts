import { TemplateResult, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/tree/tree.js";

export function Tree(props: { contentFn: () => TemplateResult }) {
  return () => html`
    <sl-tree
      style=${styleMap({
        "--indent-guide-width": "1px",
      })}
      selection="leaf"
    >
      ${props.contentFn()}
    </sl-tree>
  `;
}
