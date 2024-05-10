import {
  lockNames,
  messageTypes,
  sessionStorageKeys,
  syncStorageKeys,
  tabGroupColorList,
  tabGroupTypes,
  titles,
} from "./constants";
import {
  type TabGroupTreeData,
  createBookmarkNodeAndSyncId,
  getStorageData,
  setStorageData,
  subscribeToMessage,
  updateTabGroupTreeDataAndCurrentSessionData,
} from "./sharedUtils";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async () => {
  // @error
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.pinnedTabGroupBookmarkNodeId,
    titles.pinnedTabGroup,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.runtime.onStartup.addListener(async () => {
  // @error
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.pinnedTabGroupBookmarkNodeId,
    titles.pinnedTabGroup,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onCreated.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onRemoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onUpdated.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

async function restoreTabIfBlank(tabId: chrome.tabs.Tab["id"]) {
  try {
    if (tabId) {
      const tab = await chrome.tabs.get(tabId);
      let url: URL | undefined;
      if (tab.url) {
        url = new URL(tab.url);
      }
      if (
        url?.hostname === chrome.runtime.id &&
        url?.pathname === "/stubPage.html"
      ) {
        const params = new URLSearchParams(url.search);
        await chrome.tabs.update(tabId, {
          url: params.get("url") ?? undefined,
        });
      }
    }
  } catch (error) {
    // just discard error. if tab can't be found, there's not reason to restore it
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // @error
  await restoreTabIfBlank(activeInfo.tabId);
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onAttached.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onCreated.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onDetached.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onRemoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onReplaced.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
  // @error
  if (changeInfo.title || changeInfo.url) {
    await setStorageData(
      sessionStorageKeys.readyToUpdateCurrentSessionData,
      true,
    );
  }
  await updateTabGroupTreeDataAndCurrentSessionData();
});

async function initSessionTabs(
  newSessionData?: chrome.bookmarks.BookmarkTreeNode,
) {
  // @maybe
  await navigator.locks.request(lockNames.applyUpdates, async () => {
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
      if (
        oldSessionData &&
        newSessionData &&
        tabGroup.type === tabGroupTypes.pinned
      ) {
        continue;
      }
      for (const tab of tabGroup.tabs) {
        await chrome.tabs.remove(tab.id!);
      }
    }
    if (!oldSessionData && newSessionData) {
      const pinnedTabGroupBookmarkNodeId = await getStorageData<
        chrome.bookmarks.BookmarkTreeNode["id"]
      >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
      if (pinnedTabGroupBookmarkNodeId) {
        const pinnedTabGroupBookmarkNodeChildren =
          await chrome.bookmarks.getChildren(pinnedTabGroupBookmarkNodeId);
        for (const tabData of pinnedTabGroupBookmarkNodeChildren.reverse()) {
          const url = `/stubPage.html?title=${encodeURIComponent(
            tabData.title,
          )}&url=${encodeURIComponent(tabData.url ?? "")}`;
          await chrome.tabs.create({
            url,
            pinned: true,
            active: false,
          });
        }
      } else {
        // @error
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
          tabGroupData.title === titles.ungroupedTabGroup;
        if (tabGroupData.url) {
          continue;
        }
        if (
          !tabGroupColorList.includes(tabGroupColor) &&
          !isUngroupedTabGroupData
        ) {
          continue;
        }
        const tabIds: chrome.tabs.Tab["id"][] = [];
        const tabGroupDataChildren = tabGroupData.children ?? [];
        for (let j = 0; j < tabGroupDataChildren.length; j++) {
          const tabData = tabGroupDataChildren[j];
          const active = i === 0 && j === 0 ? true : false;
          const url = `/stubPage.html?title=${encodeURIComponent(
            tabData.title,
          )}&url=${encodeURIComponent(tabData.url ?? "")}${
            active ? "&active=true" : ""
          }`;
          const tab = await chrome.tabs.create({
            url,
            active,
          });
          tabIds.push(tab.id);
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
        if (tabGroup.type === tabGroupTypes.pinned) {
          tabGroup.tabs.reverse();
        }
        const pinned = tabGroup.type === tabGroupTypes.pinned;
        const isUngroupedTabGroupData =
          tabGroup.id === chrome.tabGroups.TAB_GROUP_ID_NONE;
        const tabIds: chrome.tabs.Tab["id"][] = [];
        const tabs = tabGroup.tabs;
        for (let j = 0; j < tabs.length; j++) {
          const oldTab = tabs[j];
          const active =
            (previousUnsavedSessionTabGroupTreeData.length === 1 && j === 0) ||
            (i === 0 && j === 0 && tabGroup.type !== tabGroupTypes.pinned) ||
            (i === 1 &&
              j === 0 &&
              previousUnsavedSessionTabGroupTreeData[0].type ===
                tabGroupTypes.pinned)
              ? true
              : false;
          const url = `/stubPage.html?title=${encodeURIComponent(
            oldTab.title ?? "",
          )}&url=${encodeURIComponent(oldTab.url ?? "")}${
            active ? "&active=true" : ""
          }`;
          const tab = await chrome.tabs.create({
            url,
            active,
            pinned,
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
    const sessionTabs = await chrome.tabs.query({ windowType: "normal" });
    if (sessionTabs.length > 1) {
      await chrome.tabs.remove(stubTab.id!);
    }
  });
}

subscribeToMessage(messageTypes.initSessionTabs, async (newSessionData) => {
  // @error
  await initSessionTabs(newSessionData);
});

subscribeToMessage(messageTypes.restoreTab, async (_, sender) => {
  // @error
  await restoreTabIfBlank(sender.tab?.id);
});
