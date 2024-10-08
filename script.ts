import { render } from "lit";
import { h } from "promethium-js";
import { App } from "./src/App";
import { setThemeMode } from "./src/utils";
import { createBookmarkNodeAndSyncId, sendMessage } from "./sharedUtils";
import { titles, syncStorageKeys, messageTypes } from "./constants";
import "./customElements";

(async function () {
  // @error
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.pinnedTabGroupBookmarkNodeId,
    titles.pinnedTabGroup,
  );
  await sendMessage({
    type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
  });
  // auto light/dark mode based on user preferences
  if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeMode("dark");
      document.documentElement.classList.add("sl-theme-dark");
    } else {
      setThemeMode("light");
      document.documentElement.classList.remove("sl-theme-dark");
    }
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          setThemeMode("dark");
          document.documentElement.classList.add("sl-theme-dark");
        } else {
          setThemeMode("light");
          document.documentElement.classList.remove("sl-theme-dark");
        }
      });
  }
  render(h(App), document.body);
})();
