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
) {
  const icon = {
    danger: "exclamation-octagon",
    success: "check2-circle",
    warning: "exclamation-triangle",
  };
  const alert = Object.assign(document.createElement("sl-alert"), {
    variant,
    closable: true,
    duration: 3000,
    innerHTML: `<sl-icon name="${icon[variant]}" slot="icon"></sl-icon>${message}`,
  });
  document.body.append(alert);
  alert.toast();
}

// --- Later ---
// TODO: fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click)
// TODO: add more entries to the `newTabUrls` array to cater for more browsers
// TODO: resolve unloaded tab status thingy with `TreeItemColorPatchOrIcon` component
// TODO: add button in some alerts to reset view (rerender app or reload page or reopen sidepanel)
// TODO: delete unneeded icons (if necessary). be sure not to break anything if you attempt this!
// TODO: implement internationalization
//
// --- Urgent ---
// TODO: implement proper error handling. look for keywords `async`, `await` and `chrome`
// TODO: handle possible errors in async html template functions with fallback content and alerts. look for keyword `until`
// TODO: general code inspection and refactoring
// TODO: type all `setStorageData` and `getStorageData` for automatic inference
//
// --- Super Urgent. Implement Before Release! ---
// TODO: implement drag-and-drop for tabs and tab groups
// TODO: implement "recently closed" tab groups feature
// TODO: implement "copy to session / copy to tab group" feature
// TODO: implement tab discarding
// TODO: implement automatic session saving
