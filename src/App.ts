import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/tab-group/tab-group.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/divider/divider.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import { h } from "promethium-js";
import { type Ref } from "lit/directives/ref";
import { SessionView } from "./SessionView";
import { tabGroupColors } from "./globals";
import { Toolbar } from "./Toolbar";
import { ProfileToolbar } from "./ProfileToolbar";

export function App() {
  function randomTabGroupColorValue() {
    const tabGroupColorValues = Object.values(tabGroupColors());

    return tabGroupColorValues[
      Math.floor(Math.random() * tabGroupColorValues.length)
    ];
  }

  function submitButton(text: string) {
    return html`
      <sl-button
        type="submit"
        style=${styleMap({
          display: "block",
          fontSize: "1rem",
          marginTop: "3rem",
        })}
        variant="primary"
        >${text}</sl-button
      >
    `;
  }

  function addTabGroupDialogContent(ref: Ref<SlDialog>) {
    return html`
      <form class="add-button-dialog-content">
        <sl-input name="title" placeholder="Title"></sl-input>
        <sl-select name="color" placeholder="Color" hoist>
          ${Object.entries(tabGroupColors()).map(
            ([colorName, colorValue]) => html`
              <sl-option value=${colorValue}
                ><div></div>
                <span
                  slot="prefix"
                  style=${styleMap({
                    background: colorValue,
                    width: "0.8rem",
                    height: "0.8rem",
                    marginRight: "1rem",
                    borderRadius: "50%",
                    outline: "0.15rem solid var(--sl-color-neutral-1000)",
                    outlineOffset: "0.15rem",
                  })}
                ></span
                >${colorName}</sl-option
              >
            `,
          )}
        </sl-select>
        ${submitButton("Save")}
      </form>
    `;
  }

  function addCaptureGroupDialogContent(ref: Ref<SlDialog>) {
    return html`
      <form class="add-button-dialog-content">
        <sl-input name="title" placeholder="Title"></sl-input>
        <sl-input name="start" placeholder="Start"></sl-input>
        <sl-input name="contains" placeholder="Contains"></sl-input>
        <sl-input name="end" placeholder="End"></sl-input>
        ${submitButton("Save")}
      </form>
    `;
  }

  return () =>
    html`<div id="app">
      <div style=${styleMap({ width: "min(800px, 95%)", margin: "auto" })}>
        <div
          style=${styleMap({
            fontSize: "--sl-font-size-small",
            width: "100%",
          })}
        >
          <div
            style=${styleMap({
              display: "flex",
              flexDirection: "column",
            })}
          >
            ${h(ProfileToolbar)} ${h(Toolbar)}
            <sl-divider
              style=${styleMap({
                margin: "0.5rem 0",
              })}
            ></sl-divider>
            ${h(SessionView)}
          </div>
        </div>
      </div>
    </div>`;
}
