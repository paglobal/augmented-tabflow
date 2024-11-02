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
  sessionManagerUrls,
} from "./constants";
import "./customElements";

initApp(
  App,
  async () => {
    // @error
    const [error, currentTab] = await withError(chrome.tabs.getCurrent());
    if (error) {
      // @handle
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
      url: sessionManagerUrls,
    });
    for (const tabPage of tabPages) {
      if (tabPage.id && tabPage.id !== currentTab?.id) {
        await chrome.tabs.remove(tabPage.id);
      }
    }
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
