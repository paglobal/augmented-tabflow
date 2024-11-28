import { App } from "./src/App";
import { initApp } from "./src/utils";
import { sendMessage } from "./sharedUtils";
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
  await sendMessage({
    type: messageTypes.initializeBookmarkNodes,
  });
  await sendMessage({
    type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
  });
});
