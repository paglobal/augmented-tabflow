import {
  applyUpdatesLockName,
  messageTypes,
  sessionStorageKeys,
  tabGroupColorList,
  ungroupedTabGroupTitle,
} from "./constants";
import {
  type TabGroupTreeData,
  createRootBookmarkNode,
  getStorageData,
  setStorageData,
  subscribeToMessage,
  updateTabGroupTreeData,
} from "./sharedUtils";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  createRootBookmarkNode();
  updateTabGroupTreeData();
});

chrome.runtime.onStartup.addListener(() => {
  createRootBookmarkNode();
  updateTabGroupTreeData();
});

updateTabGroupTreeData();

chrome.tabGroups.onCreated.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabGroups.onRemoved.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabGroups.onUpdated.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

async function restoreTabIfBlank(tabId: NonNullable<chrome.tabs.Tab["id"]>) {
  try {
    const tab = await chrome.tabs.get(tabId);
    let url: URL | undefined;
    if (tab.url) {
      url = new URL(tab.url);
    }
    if (url?.hostname === chrome.runtime.id) {
      const params = new URLSearchParams(url.search);
      await chrome.tabs.update(tabId, {
        url: params.get("url") ?? undefined,
      });
    }
  } catch (error) {
    // just discard error. if tab can't be found, there's not reason to restore it
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await restoreTabIfBlank(activeInfo.tabId);
  await updateTabGroupTreeData();
});

chrome.tabs.onAttached.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onCreated.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onDetached.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onRemoved.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onReplaced.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
  if (changeInfo.title || changeInfo.url) {
    await setStorageData(
      sessionStorageKeys.readyToUpdateCurrentSessionData,
      true,
    );
  }
  await updateTabGroupTreeData();
});

async function initSessionTabs(
  newSessionData?: chrome.bookmarks.BookmarkTreeNode,
) {
  navigator.locks.request(applyUpdatesLockName, async () => {
    const oldSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );
    const tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData,
      )) ?? [];
    if (!oldSessionData) {
      await setStorageData<TabGroupTreeData>(
        sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
        tabGroupTreeData,
      );
    }
    await setStorageData(sessionStorageKeys.currentSessionData, "");
    await setStorageData(sessionStorageKeys.currentSessionData, newSessionData);
    await setStorageData(sessionStorageKeys.ungroupedTabGroupCollapsed, false);
    await setStorageData(
      sessionStorageKeys.recentlyClosedTabGroupsCollapsed,
      true,
    );
    await setStorageData(sessionStorageKeys.recentlyClosedTabGroups, []);
    const stubTab = await chrome.tabs.create({ active: false });
    for (const tabGroup of tabGroupTreeData) {
      for (const tab of tabGroup.tabs) {
        await chrome.tabs.remove(tab.id!);
      }
    }
    if (newSessionData) {
      const sessionData = (
        await chrome.bookmarks.getSubTree(newSessionData.id)
      )[0];
      const sessionDataChildren = sessionData.children ?? [];
      if (!sessionDataChildren?.length) {
        await chrome.tabs.create({ active: false });
      }
      for (let i = 0; i < sessionDataChildren.length; i++) {
        const tabGroupData = sessionDataChildren[i];
        const tabGroupColor = tabGroupData.title.split(
          "-",
        )[0] as chrome.tabGroups.Color;
        const isUngroupedTabGroupData =
          tabGroupData.title === ungroupedTabGroupTitle;
        if (tabGroupData.url) {
          await chrome.bookmarks.remove(tabGroupData.id);

          continue;
        }
        if (
          !tabGroupColorList.includes(tabGroupColor) &&
          !isUngroupedTabGroupData
        ) {
          await chrome.bookmarks.removeTree(tabGroupData.id);

          continue;
        }
        const tabIds: chrome.tabs.Tab["id"][] = [];
        const tabGroupDataChildren = tabGroupData.children ?? [];
        for (let j = 0; j < tabGroupDataChildren.length; j++) {
          const tabData = tabGroupDataChildren[j];
          if (tabData.children) {
            await chrome.bookmarks.removeTree(tabData.id);

            continue;
          }
          if (tabData.url) {
            const tabUrl =
              i === 0 && j === 0
                ? tabData.url
                : `/stubPage.html?title=${tabData.title}&url=${tabData.url}`;
            const tabIsActive = i === 0 && j === 0 ? true : false;
            const tab = await chrome.tabs.create({
              url: tabUrl,
              active: tabIsActive,
            });
            tabIds.push(tab.id);
          }
        }
        if (!isUngroupedTabGroupData && tabIds.length) {
          const tabGroupTitle = tabGroupData.title
            .split("-")
            .slice(1)
            .join("-");
          const tabGroupId = await chrome.tabs.group({
            tabIds: tabIds as [number, ...number[]],
          });
          await chrome.tabGroups.update(tabGroupId, {
            color: tabGroupColor,
            collapsed: i === 0 ? false : true,
            title: tabGroupTitle,
          });
        }
      }
    } else {
      const previousUnsavedSessionTabGroupTreeData =
        (await getStorageData<TabGroupTreeData>(
          sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
        )) ?? [];
      if (!previousUnsavedSessionTabGroupTreeData?.length) {
        await chrome.tabs.create({ active: false });
      }
      for (let i = 0; i < previousUnsavedSessionTabGroupTreeData.length; i++) {
        const tabGroup = previousUnsavedSessionTabGroupTreeData[i];
        const isUngroupedTabGroupData =
          tabGroup.id === chrome.tabGroups.TAB_GROUP_ID_NONE;
        const tabIds: chrome.tabs.Tab["id"][] = [];
        const tabs = tabGroup.tabs;
        for (let j = 0; j < tabs.length; j++) {
          const oldTab = tabs[j];
          const tabUrl =
            i === 0 && j === 0
              ? oldTab.url
              : `/stubPage.html?title=${oldTab.title}&url=${oldTab.url}`;
          const tabIsActive = i === 0 && j === 0 ? true : false;
          const tab = await chrome.tabs.create({
            url: tabUrl,
            active: tabIsActive,
          });
          tabIds.push(tab.id);
        }
        if (!isUngroupedTabGroupData && tabIds.length) {
          const { title, color } = tabGroup;
          const tabGroupId = await chrome.tabs.group({
            tabIds: tabIds as [number, ...number[]],
          });
          await chrome.tabGroups.update(tabGroupId, {
            color,
            collapsed: i === 0 ? false : true,
            title,
          });
        }
      }
    }
    await chrome.tabs.remove(stubTab.id!);
  });
}

subscribeToMessage(messageTypes.initSessionTabs, async (newSessionData) => {
  await initSessionTabs(newSessionData);
});
