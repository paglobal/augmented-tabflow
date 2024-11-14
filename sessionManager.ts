import { App } from "./src/App";
import { initApp } from "./src/utils";
import { createBookmarkNodeAndStoreId, sendMessage } from "./sharedUtils";
import { titles, messageTypes, localStorageKeys } from "./constants";
import "./customElements";
import { cycleTabGroupSpaces } from "./src/TabGroupSpaceSwitcher";

initApp(App, async () => {
  // @error
  const popupContext = (
    await chrome.runtime.getContexts({ contextTypes: ["POPUP"] })
  )[0];
  if (popupContext) {
    document.documentElement.style.minWidth = "400px";
    document.documentElement.style.minHeight = "600px";
  }
  document.addEventListener(
    "wheel",
    function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 0) {
          cycleTabGroupSpaces("next");
        } else if (e.deltaX < 0) {
          cycleTabGroupSpaces("prev");
        }
      }
    },
    { passive: false },
  );
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
});
