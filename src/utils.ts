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
// TODO: (if necessary) delete unneeded icons. be sure not to break anything if you attempt this! look for instances of `icon` and `sl-icon` element
//       with `name="<icon-name>"`
// TODO: (maybe) implement internationalization
// TODO: (maybe) cater for more browser eg. by adding more entries to the `newTabUrls` array
// TODO: (if necessary) come up with a way to handle storage migrations
// TODO: theme switcher
// TODO: fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click and other focus related issues)
// TODO: refine and organise text. look for anything in quotation marks like "Error!" and such. make use of full stops
// TODO: general code inspection and refactoring
// TODO: (if necessary) differentiate state update functions from storage data update functions
// TODO: type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
// TODO: type `sendMessage` and `subscribeToMessage` for automatic inference
// TODO: look for `currentlyDeletedBlahBlah` and `currentlyEditedBlahBlah` and make sure they're in the right places. they should probably be in `sessionService.ts` along with their corresponding
//       functions
// TODO: implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
// TODO: handle errors in timeouts as well
// TODO: notify users of errors that happen in service workers through message `chrome.runtime.message`
// TODO: make sure to log caught errors (maybe in dev mode only)
// TODO: create util for try catch notify
// TODO: resolve unloaded tab status thing with `TreeItemColorPatchOrIcon` component. try to retry and timeout a couple of times
// TODO: (if necessary) add alerts for action start and action complete
// TODO: (if necessary) add test suite
// TODO: create `TreeDialog` and `ConfirmationDialog`
// TODO: use `await` anywhere you can
// TODO: show warning or error alerts for when certain data is unavailable
// TODO: maybe change the way arrays are typed to use Array<T>
// TODO: implement "overwrite with current session" feature
//
// --- Urgent ---
// TODO: implement loading fallback for session and tab group trees which provide a way to exit loading of current session (eg. for when user interrupts session switching
//       loading continues indefinitely)
// TODO: implement pinned tab groups
// TODO: implement drag-and-drop for tabs, tab groups and sessions. be careful when trying to move pinned tabs.
// TODO: implement recently closed tab groups feature
//
// --- Extension ---
// Upload better screenshots and photos
// Upload better description and summary
// Maybe upload a video
//
// --- Docs ---
// Add reference to video
