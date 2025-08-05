import { styleMap } from "lit/directives/style-map.js";
import { SlSelectionChangeEvent } from "@shoelace-style/shoelace";

export function Tree(props: {
  contentFn: () => unknown;
  height?: string;
  errorFn: (e: SlSelectionChangeEvent) => void;
}) {
  return () => {
    return (
      <sl-tree
        $attr:style={styleMap({
          height: props.height ?? undefined,
          overflowY: "auto",
        })}
        selection="leaf"
        tabindex="-1"
        on:sl-selection-change={(e) => {
          // @handled
          try {
            e.detail.selection.forEach((treeItem) => treeItem.click());
          } catch (error) {
            console.error(error);
            props.errorFn(e);
          }
        }}
      >
        {props.contentFn()}
      </sl-tree>
    );
  };
}
