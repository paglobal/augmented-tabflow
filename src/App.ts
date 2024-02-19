import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { ref, createRef } from "lit/directives/ref.js";
import "@shoelace-style/shoelace/dist/components/tab/tab.js";
import "@shoelace-style/shoelace/dist/components/tab-group/tab-group.js";
import "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js";
import "@shoelace-style/shoelace/dist/components/divider/divider.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import questionCircleIcon from "./assets/icons/question-circle.svg";
import sortUpIcon from "./assets/icons/sort-up.svg";
import sortDownIcon from "./assets/icons/sort-down.svg";
import plusCircleIcon from "./assets/icons/plus-circle.svg";
import { Component, h } from "promethium-js";
import { Active } from "./Active";
import { Help } from "./Help";

function Toolbar() {
  const helpDialogRef = createRef<SlDialog>();

  return () =>
    html` <div
      style=${styleMap({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
      })}
    >
      <sl-button-group label="Tools">
        <sl-icon-button
          src=${plusCircleIcon}
          style=${styleMap({ fontSize: "1rem" })}
          title="Add"
        ></sl-icon-button>
        <sl-icon-button
          src=${sortUpIcon}
          style=${styleMap({ fontSize: "1rem" })}
          title="Sort Up"
        ></sl-icon-button>
        <sl-icon-button
          src=${sortDownIcon}
          style=${styleMap({ fontSize: "1rem" })}
          title="Sort Down"
        ></sl-icon-button>
        <sl-icon-button
          src=${questionCircleIcon}
          style=${styleMap({ fontSize: "1rem" })}
          title="Help"
          @click=${() => helpDialogRef.value?.show()}
        ></sl-icon-button>
        <sl-dialog label="Help" ${ref(helpDialogRef)} style=${styleMap({})}
          >${h(Help)}</sl-dialog
        >
      </sl-button-group>
    </div>`;
}

function TabPanelPair(props: {
  name: string;
  panelContent: Component;
  isActive?: boolean;
}) {
  return () => html`
    <sl-tab
      slot="nav"
      panel=${props.name}
      style=${styleMap({
        width: "33.33%",
        textAlign: "center",
      })}
      ?active=${props.isActive}
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
        ${h(Toolbar)}
        <sl-divider
          style=${styleMap({ margin: "0.5rem 0 0.5rem 0" })}
        ></sl-divider>
        <div>${h(props.panelContent)}</div>
      </div>
    </sl-tab-panel>
  `;
}

export function App() {
  return () =>
    html`<div id="app" style=${styleMap({})}>
      <sl-tab-group
        style=${styleMap({ width: "min(800px, 95%)", margin: "auto" })}
        no-scroll-controls
      >
        ${h(TabPanelPair, {
          name: "active",
          panelContent: Active,
          isActive: true,
        })}
        ${h(TabPanelPair, {
          name: "saved",
          panelContent: () => () => html`<div>Hi, I'm saved!</div>`,
          isActive: true,
        })}
        ${h(TabPanelPair, {
          name: "captured",
          panelContent: () => () => html`<div>Hi, I'm captured!!</div>`,
          isActive: true,
        })}
      </sl-tab-group>
    </div>`;
}
