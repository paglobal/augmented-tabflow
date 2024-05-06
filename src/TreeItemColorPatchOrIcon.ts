import { html } from "lit";
import { getFaviconUrl } from "../sharedUtils";
import { tabGroupColors } from "./utils";
import { styleMap } from "lit/directives/style-map.js";

export function TreeItemColorPatchOrIcon(props: {
  color?: chrome.tabGroups.TabGroup["color"];
  icon?: string;
  pageUrl?: string;
  showSpinner?: boolean;
}) {
  return () =>
    props.color
      ? html`<span
          style=${styleMap({
            background: tabGroupColors()[props.color],
            width: "1.5rem",
            height: "0.9rem",
            marginRight: "0.7rem",
            borderRadius: "0.3rem",
          })}
        ></span>`
      : props.icon
        ? html`
            <sl-icon
              name=${props.icon}
              style=${styleMap({
                width: "1.4rem",
                height: "1.4rem",
                marginRight: "0.8rem",
                borderRadius: "0.3rem",
              })}
            ></sl-icon>
          `
        : html`
            <div
              style=${styleMap({
                width: "1.3rem",
                height: "1.3rem",
                position: "relative",
                marginRight: "0.7rem",
                outline: `0.15rem solid ${tabGroupColors()["grey"]}`,
                borderRadius: "50%",
              })}
            >
              ${props.showSpinner
                ? html`<sl-spinner
                    style=${styleMap({
                      marginTop: "0.17rem",
                      marginLeft: "0.16rem",
                    })}
                  ></sl-spinner>`
                : html`<img
                    src=${getFaviconUrl(props.pageUrl)}
                    style=${styleMap({
                      width: "1.3rem",
                      padding: "0.2rem",
                    })}
                  /> `}
            </div>
          `;
}
