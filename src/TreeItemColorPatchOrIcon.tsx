import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";
import { getFaviconUrl } from "../sharedUtils";
import { tabGroupColors } from "./utils";

export function TreeItemColorPatchOrIcon(props: {
  color?: chrome.tabGroups.TabGroup["color"];
  icon?: string;
  pageUrl?: string;
  showSpinner?: boolean;
  slot?: string;
  small?: boolean;
}) {
  const imageRef = createRef<HTMLImageElement>();

  return () => {
    setTimeout(async () => {
      // @error
      try {
        // don't think this does anything but just in case
        await fetch(getFaviconUrl(props.pageUrl), {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {}
      // actual assignment to prevent use of wrong image
      if (imageRef.value) {
        imageRef.value.src = getFaviconUrl(props.pageUrl);
      }
    }, 200);

    const iconSize = props.small ? "1rem" : "1.4rem";
    const faviconSize = props.small ? "1.2rem" : "1.3rem";

    return props.color
      ? html`<span
          style=${styleMap({
            background: tabGroupColors()[props.color],
            width: "1.5rem",
            height: "0.9rem",
            marginRight: "0.7rem",
            borderRadius: "0.3rem",
          })}
          slot=${ifDefined(props.slot)}
        ></span>`
      : props.icon
        ? html`
            <sl-icon
              name=${props.icon}
              style=${styleMap({
                width: iconSize,
                height: iconSize,
                marginRight: "0.8rem",
                borderRadius: "0.3rem",
              })}
              slot=${ifDefined(props.slot)}
            ></sl-icon>
          `
        : html`
            <div
              style=${styleMap({
                width: faviconSize,
                height: faviconSize,
                position: "relative",
                marginRight: "0.7rem",
                outline: `0.15rem solid ${tabGroupColors()["grey"]}`,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
              })}
              slot=${ifDefined(props.slot)}
            >
              ${props.showSpinner
                ? html`<sl-spinner></sl-spinner>`
                : html`<img
                    ${ref(imageRef)}
                    @error=${(e: Event) => {
                      (e.target as HTMLImageElement).src = getFaviconUrl(null);
                    }}
                    style=${styleMap({
                      width: faviconSize,
                      padding: "0.2rem",
                    })}
                  /> `}
            </div>
          `;
  };
}
