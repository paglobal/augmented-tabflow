import { App } from "./src/App";
import { setThemeMode, initApp } from "./src/utils";
import { createBookmarkNodeAndStoreId, sendMessage } from "./sharedUtils";
import { titles, messageTypes, localStorageKeys } from "./constants";
import "./customElements";

initApp(
  App,
  async () => {
    // @error
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
