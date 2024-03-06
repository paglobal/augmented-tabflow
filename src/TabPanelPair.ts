import { type Component, h } from "promethium-js";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/tab/tab.js";
import "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js";
import { Toolbar } from "./Toolbar";
import { Divider } from "./Divider";

export function TabPanelPair(props: {
  name: string;
  panelContent: Component;
  addButtonDialogProps?: Parameters<typeof Toolbar>[0]["addButtonDialogProps"];
}) {
  return () => html`
    <sl-tab
      slot="nav"
      panel=${props.name}
      style=${styleMap({
        width: "33.33%",
        textAlign: "center",
      })}
      >${props.name[0].toUpperCase() + props.name.slice(1)}</sl-tab
    >
    <sl-tab-panel
      name=${props.name}
      style=${styleMap({
        fontSize: "--sl-font-size-small",
        "--padding": "0.5rem",
        width: "100%",
      })}
    >
      <div style=${styleMap({ display: "flex", flexDirection: "column" })}>
        ${h(Toolbar, { addButtonDialogProps: props.addButtonDialogProps })}
        ${h(Divider)}
        <div>${h(props.panelContent)}</div>
      </div>
    </sl-tab-panel>
  `;
}
