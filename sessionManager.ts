import { App } from "./src/App";
import { setThemeMode, initApp } from "./src/utils";
import {
  createBookmarkNodeAndStoreId,
  getStorageData,
  sendMessage,
  setStorageData,
  withError,
} from "./sharedUtils";
import {
  titles,
  messageTypes,
  localStorageKeys,
  AntecedentTabInfo,
  sessionStorageKeys,
  sessionManagerPathName,
} from "./constants";
import "./customElements";
import { cycleTabGroupSpaces } from "./src/TabGroupSpaceSwitcher";

initApp(
  App,
  async () => {
    // @error
    const [error, currentTab] = await withError(chrome.tabs.getCurrent());
    if (error) {
      // @handle
    }
    if (currentTab) {
      await chrome.sidePanel.setOptions({ enabled: false });
      await chrome.sidePanel.setOptions({ enabled: true });
    }
    const [_error, antecedentTabInfo] = await withError(
      getStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo),
    );
    if (_error) {
      // @handle
    }
    const [__error] = await withError(
      setStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo, {
        id: currentTab?.id,
        precedentTabId: antecedentTabInfo?.precedentTabId,
      }),
    );
    if (__error) {
      // @handle
    }
    const tabPages = await chrome.tabs.query({
      url: `chrome-extension://${chrome.runtime.id}${sessionManagerPathName}`,
    });
    for (const tabPage of tabPages) {
      if (tabPage.id && tabPage.id !== currentTab?.id) {
        await chrome.tabs.remove(tabPage.id);
      }
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
      { passive: true },
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
  },
  setThemeMode,
);
