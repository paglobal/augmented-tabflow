import { App } from "./src/App";
import { setThemeMode, initApp } from "./src/utils";
import { createBookmarkNodeAndStoreId, sendMessage } from "./sharedUtils";
import { titles, messageTypes, localStorageKeys } from "./constants";
import "./customElements";

initApp(
  App,
  async () => {
    // @error
    const params = new URLSearchParams(document.location.search);
    const tabPage = params.get("tabPage");
    if (tabPage) {
      document.addEventListener("visibilitychange", async () => {
        if (document.hidden) {
          close();
        }
      });
    }
    await createBookmarkNodeAndStoreId(
      localStorageKeys.rootBookmarkNodeId,
      titles.rootBookmarkNode,
    );
    await createBookmarkNodeAndStoreId(
      localStorageKeys.pinnedTabGroupBookmarkNodeId,
      titles.pinnedTabGroup,
    );
    await sendMessage({
      type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
    });
  },
  setThemeMode,
);
