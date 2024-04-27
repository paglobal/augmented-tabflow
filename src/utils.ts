import { SlAlert } from "@shoelace-style/shoelace";
import { adaptState } from "promethium-js";

export const [themeMode, setThemeMode] = adaptState<"light" | "dark">("light");

export const tabGroupColors = () => ({
  grey: themeMode() === "dark" ? "#DADBE0" : "#5E6268",
  blue: "#85A8F8",
  red: "#FF7980",
  yellow: "#FFDF63",
  green: "#54D796",
  pink: "#FF5CCA",
  purple: "#DB54F8",
  cyan: "#41DDED",
  orange: "#FFAA6F",
});

export function randomTabGroupColorValue() {
  const tabGroupColorNames = Object.keys(tabGroupColors());

  return tabGroupColorNames[
    Math.floor(Math.random() * tabGroupColorNames.length)
  ] as chrome.tabGroups.Color;
}

// copied from "https://shoelace.style/components/alert" and slightly modified
export function notify(
  message: string,
  variant: Exclude<SlAlert["variant"], "primary" | "neutral"> = "danger",
  duration: number = 3000,
) {
  const icon = {
    danger: "exclamation-octagon",
    success: "check2-circle",
    warning: "exclamation-triangle",
  };
  const alert = Object.assign(document.createElement("sl-alert"), {
    variant,
    closable: true,
    duration,
    innerHTML: `<sl-icon name="${icon[variant]}" slot="icon"></sl-icon>${message}`,
  });
  document.body.append(alert);
  alert.toast();
}

export function notifyWithErrorMessageAndReloadButton() {
  const errorMessage =
    "Error occurred while executing action. You can click the button below to attempt to recover.";
  const reloadButtonHTML = `<sl-icon-button name="arrow-counterclockwise" title="Reload UI" class="reload-button"></sl-icon-button>`;
  const fullMessageContent = `<div>${errorMessage}</div><div style="display: flex; justify-content: center; align-items: center;">${reloadButtonHTML}</div>`;
  notify(fullMessageContent, "danger", 6000);
  document
    .querySelectorAll(".reload-button")
    .forEach((button) =>
      button.addEventListener("click", () => location.reload()),
    );
}

// --- Later ---
// TODO: delete unneeded icons (if necessary). be sure not to break anything if you attempt this!
// TODO: implement internationalization
// TODO: come up with a way to handle storage migrations
// TODO: theme switcher
// TODO: general code inspection and refactoring
// TODO: differentiate state update functions from storage data update functions (if necessary)
// TODO: type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
// TODO: type `sendMessage` and `subscribeToMessage` for automatic inference
// TODO: fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click)
// TODO: add more entries to the `newTabUrls` array to cater for more browsers
// TODO: resolve unloaded tab status thingy with `TreeItemColorPatchOrIcon` component
//
// --- Urgent ---
// TODO: implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `until` and `chrome`
// TODO: add alerts for action in progress and action complete.
// TODO: implement "move/copy to session / move/copy to tab group" feature
// TODO: implement "recently closed" tab groups feature
// TODO: implement drag-and-drop for tabs and tab groups
// TODO: implement confirmation dialog for deleting sessions
// TODO: show loading state for tab group tree when switching between sessions
//
// --- Docs ---
// Turn of reopening of session in browser
// Be weary of native saved tab groups in chrome
// Don't close sidepanel while action is in progress
// Tabs load in a "discarded" state
// Don't use with chrome native saved tab groups
// Designed to be used with one "normal" browser window at a time
