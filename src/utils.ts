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
  const reloadButtonHTML = `<sl-icon-button name="arrow-clockwise" title="Reload UI" class="reload-button"></sl-icon-button>`;
  const fullMessageContent = `<div>${errorMessage}</div><div style="display: flex; justify-content: center; align-items: center;">${reloadButtonHTML}</div>`;
  notify(fullMessageContent, "danger", 6000);
  document
    .querySelectorAll(".reload-button")
    .forEach((button) =>
      button.addEventListener("click", () => location.reload()),
    );
}

// --- Later ---
// TODO: delete unneeded icons (if necessary). be sure not to break anything if you attempt this! look for instances of `icon` and `sl-icon` element
//       with `name="<icon-name>"`
// TODO: implement internationalization
// TODO: come up with a way to handle storage migrations
// TODO: theme switcher
// TODO: differentiate state update functions from storage data update functions (if necessary)
// TODO: type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
// TODO: type `sendMessage` and `subscribeToMessage` for automatic inference
// TODO: fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click and other focus related issues)
// TODO: add more entries to the `newTabUrls` array to cater for more browsers
// TODO: refine text. look for anything in quotation marks like "Error!" and such
// TODO: general code inspection and refactoring
// TODO: implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
// TODO: notify users of errors that happen in service workers through message `chrome.runtime.message`
//
// --- Urgent ---
// TODO: resolve unloaded tab status thing with `TreeItemColorPatchOrIcon` component. use the old "timeout and retry a couple of times"
// TODO: add alerts for action in progress and action complete (if necessary) (mostly when saving current session).
// TODO: implement "move/copy to session / move/copy to tab group" feature
// TODO: implement "recently closed" tab groups feature
// TODO: implement drag-and-drop for tabs, tab groups and sessions
// TODO: show confirmation dialog for deleting sessions
// TODO: implement loading fallback for session and tab group trees which provide a way to exit loading of current session (eg. for when user interrupts session switching
//       loading continues indefinitely)
// TODO: add option to create new tab group with existing tab
// TODO: implement pinned tab groups
//
// --- Extension ---
// Upload better screenshots and photos
// Upload better description and summary
// Maybe upload a video
//
// --- Docs ---
//
