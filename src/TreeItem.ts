import { TemplateResult, html } from "lit";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import { styleMap } from "lit/directives/style-map.js";

export function TreeItem(props: {
  content: TemplateResult;
  tooltipContent: string;
  actionButtons?: TemplateResult;
  expanded?: boolean;
  selected?: boolean;
  onExpand?: (e: Event) => void;
  onCollapse?: (e: Event) => void;
  onSelect?: (e: Event) => void;
}) {
  // TODO: fix accessibility issues relating to keyboard navigation (enter should cause element click)
  return () => html`
    <sl-tree-item
      title=${props.tooltipContent}
      style=${styleMap({
        overflow: "hidden",
        whiteSpace: "noWrap",
        position: "relative",
      })}
      ?expanded=${props.expanded}
      ?selected=${props.selected}
      @sl-expand=${props.onExpand}
      @sl-collapse=${props.onCollapse}
      @click=${props.onSelect}
    >
      <div
        class="actions-container"
        style=${styleMap({
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          minHeight: "2rem",
          textAlign: "right",
        })}
        @mouseleave=${(e: Event) =>
          (e.target as HTMLElement)?.parentElement?.blur()}
        @mouseout=${(e: Event) =>
          (e.target as HTMLElement)?.parentElement?.blur()}
      >
        <sl-button-group
          label="Actions"
          style=${styleMap({
            padding: "0 0.4rem",
          })}
        >
          ${props.actionButtons}
        </sl-button-group>
      </div>
      ${props.content}
    </sl-tree-item>
  `;
}
