import { App } from "./src/App";
import { setThemeMode, initApp } from "./src/utils";
import { createBookmarkNodeAndSyncId, sendMessage } from "./sharedUtils";
import { titles, syncStorageKeys, messageTypes } from "./constants";
import "./customElements";

initApp(
  App,
  async () => {
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
  },
  setThemeMode,
);
