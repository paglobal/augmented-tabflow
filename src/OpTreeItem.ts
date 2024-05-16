import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { property } from "lit/decorators/property.js";

declare global {
  interface HTMLElementTagNameMap {
    "op-tree-item": OpTreeItem;
  }
}

@customElement("op-tree-item")
class OpTreeItem extends LitElement {
  static styles = css`
    ::slotted(op-tree-item) {
      display: none;
    }

    :host div {
      display: flex;
    }

    :host([expanded]) ::slotted(op-tree-item) {
      display: block;
    }
  `;

  @property({ type: Boolean })
  expanded = false;

  @property({ type: Boolean })
  selected = false;

  render() {
    return html`<div id="base"><slot name="base"></slot></div>
      <slot></slot> `;
  }
}
