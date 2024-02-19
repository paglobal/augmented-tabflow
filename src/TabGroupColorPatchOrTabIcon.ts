import { html } from "lit";
import { tabGroupColors } from "./constants";
import { styleMap } from "lit/directives/style-map.js";

function faviconUrl(pageUrl: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl);
  url.searchParams.set("size", "32");

  return url.toString();
}

export function TabGroupColorPatchOrTabIcon(props: {
  color?: string;
  pageUrl?: string;
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
            <img
              src=${faviconUrl(props.pageUrl)}
              style=${styleMap({
                width: "1.3rem",
                padding: "0.2rem",
              })}
            />
          </div>
        `;
}
