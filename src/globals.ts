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

// copied into `../service-worker.ts` because of some issues with directly importing
// an update here should reflect there!up
export const rootBookmarkNodeTitle = "Augmented Tabflow Saved Tab Groups";

// copied into `../service-worker.ts` because of some issues with directly importing
// an update here should reflect there!
export const syncStorageKeys = {
  rootBookmarkNodeId: "1",
} as const;

// TODO: implement internationalization
// TODO: (maybe) implement moving tab groups to and from windows
// TODO: add tsc type-checking to dev workflow
