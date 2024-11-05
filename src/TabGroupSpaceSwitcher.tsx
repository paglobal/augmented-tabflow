import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { currentTabGroupSpaceIndex, tabGroups } from "./sessionService";
import { tabGroupColors } from "./utils";
import { debounce, setStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";

export const cycleTabGroupSpaces = debounce(
  async (cycleTo?: "prev" | "next") => {
    const _currentTabGroupSpaceIndex = currentTabGroupSpaceIndex();
    if (cycleTo === "prev") {
      await setStorageData<number>(
        sessionStorageKeys.currentTabGroupSpaceIndex,
        _currentTabGroupSpaceIndex - 1,
      );
    } else {
      await setStorageData<number>(
        sessionStorageKeys.currentTabGroupSpaceIndex,
        _currentTabGroupSpaceIndex + 1,
      );
    }
  },
  50,
);

export function TabGroupSpaceSwitcher() {
  const _tabGroupColors = {
    sky: "var(--sl-color-sky-600)",
    default: "var(--sl-color-neutral-0)",
    ...tabGroupColors(),
  } as ReturnType<typeof tabGroupColors> & {
    sky: "var(--sl-color-sky-600)";
    default: "var(--sl-color-neutral-0)";
  };

  const fadedDiv = (backgroundColor: string) => {
    return html`
      <div
        style=${styleMap({
          opacity: "0.2",
          height: "1.5rem",
          width: "1.25rem",
          borderRadius: "var(--sl-input-border-radius-small)",
          backgroundColor,
        })}
      ></div>
    `;
  };

  return () => {
    const _tabGroups = tabGroups();
    const _currentTabGroupSpaceIndex = currentTabGroupSpaceIndex();
    const previousTabGroupSpaceColor =
      _tabGroupColors[
        (
          _tabGroups[_currentTabGroupSpaceIndex - 1] ??
          _tabGroups[_tabGroups.length - 1]
        )?.color ?? "default"
      ];
    const currentTabGroupSpaceColor =
      _tabGroupColors[_tabGroups[_currentTabGroupSpaceIndex]?.color ?? "sky"];
    const nextTabGroupSpaceColor =
      _tabGroupColors[
        (_tabGroups[_currentTabGroupSpaceIndex + 1] ?? _tabGroups[0])?.color ??
          "default"
      ];

    return html` <div
      style=${styleMap({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "1.25rem",
        gap: "0.5rem",
        width: "auto",
        height: "auto",
      })}
    >
      <style>
        sl-button.switcher-button::part(base) {
          border-width: 0rem;
          --sl-input-height-small: 1.75rem;
          width: 1.5rem;
          background-color: ${currentTabGroupSpaceColor};
          transition: transform 0.1s ease;
        }

        sl-button.switcher-button::part(base):hover {
          filter: brightness(0.9);
          transform: scale(1.1);
        }

        sl-button.switcher-button::part(base):active {
          filter: brightness(1);
        }
      </style>
      ${fadedDiv(previousTabGroupSpaceColor)}
      <sl-button
        title="Next Tab Group Space"
        class="switcher-button"
        size="small"
        @click=${async () => {
          cycleTabGroupSpaces("next");
        }}
      ></sl-button>
      ${fadedDiv(nextTabGroupSpaceColor)}
    </div>`;
  };
}
