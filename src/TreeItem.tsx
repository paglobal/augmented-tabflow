import { html } from "lit";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import { styleMap } from "lit/directives/style-map.js";
import { PromethiumNode, adaptEffect, adaptState } from "promethium-js";
import { createRef, ref } from "lit/directives/ref.js";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import type SlTreeItem from "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";

type DraggableOptions = Parameters<typeof draggable>[0];
type DropTargetOptions = Parameters<typeof dropTargetForElements>[0];

export function TreeItem(props: {
  children: PromethiumNode;
  tooltipContent: string;
  actionButtons?: PromethiumNode;
  expanded?: boolean;
  selected?: boolean;
  onExpand?: (e: Event) => void;
  onCollapse?: (e: Event) => void;
  onSelect?: (e: Event) => void;
  draggableOptions?: Partial<DraggableOptions>;
  dropTargetOptions?: Partial<DropTargetOptions>;
}) {
  const [draggedOverEdge, setDraggedOverEdge] = adaptState<Edge | null>(null);
  const [dragging, setDragging] = adaptState(false);
  const treeItemRef = createRef<SlTreeItem>();

  adaptEffect(() => {
    if (
      props.draggableOptions &&
      props.dropTargetOptions &&
      treeItemRef.value
    ) {
      props.draggableOptions.element = treeItemRef.value;
      props.draggableOptions.onDragStart = () => setDragging(true);
      props.draggableOptions.onDrop = () => setDragging(false);
      props.dropTargetOptions.element = treeItemRef.value;
      const previousGetDataFn = props.dropTargetOptions.getData;
      props.dropTargetOptions.getData = ({ input, element, source }) => {
        // @maybe
        const data =
          previousGetDataFn?.({
            input,
            element,
            source,
          }) ?? {};

        return attachClosestEdge(data, {
          input,
          element,
          // you can specify what edges you want to allow the user to be closest to
          allowedEdges: ["top", "bottom"],
        });
      };
      props.dropTargetOptions.onDrag = ({ self, source }) => {
        // @maybe
        const closestEdgeOfTarget = extractClosestEdge(self.data);
        if (
          self.element === source.element ||
          self.data.type !== source.data.type
        ) {
          setDraggedOverEdge(null);
        } else {
          setDraggedOverEdge(closestEdgeOfTarget);
        }
      };
      props.dropTargetOptions.onDragLeave = () => {
        // @maybe
        setDraggedOverEdge(null);
      };
      const previousOnDropFunction = props.dropTargetOptions.onDrop;
      props.dropTargetOptions.onDrop = ({ self, location, source }) => {
        // @maybe
        if (
          self.data.type === source.data.type &&
          self.element !== source.element
        ) {
          previousOnDropFunction?.({ self, location, source });
        }
        setDraggedOverEdge(null);
      };

      return combine(
        draggable(props.draggableOptions as DraggableOptions),
        dropTargetForElements(props.dropTargetOptions as DropTargetOptions),
      );
    }
  }, []);

  return () => {
    const draggedOverStyles = draggedOverEdge()
      ? {
          [`border-${draggedOverEdge()}`]:
            "0.15rem solid var(--sl-color-primary-500)",
        }
      : {};

    return html`
      <sl-tree-item
        ${ref(treeItemRef)}
        title=${props.tooltipContent}
        style=${styleMap({
          overflow: "hidden",
          whiteSpace: "noWrap",
          position: "relative",
          opacity: dragging() ? 0.5 : 1,
          ...draggedOverStyles,
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
        ${props.children}
      </sl-tree-item>
    `;
  };
}
