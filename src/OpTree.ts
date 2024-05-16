import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators/custom-element.js";

declare global {
  interface HTMLElementTagNameMap {
    "op-tree": OpTree;
  }
}

@customElement("op-tree")
class OpTree extends LitElement {
  static styles = css`
    :host {
      overflow-y: auto;
      height: var(--height);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
