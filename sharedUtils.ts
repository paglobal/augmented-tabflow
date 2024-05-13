import {
  type SyncStorageKey,
  type SessionStorageKey,
  syncStorageKeys,
  AreaName,
  TabGroupType,
  tabGroupTypes,
  sessionStorageKeys,
  MessageType,
  tabGroupTreeDataUpdateDebounceTimeout,
  lockNames,
  titles,
} from "./constants";

export async function getStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
  value: T,
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].set({ [key]: value });
}

export async function subscribeToStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
  fn: (changes: { newValue: T | undefined; oldValue: T | undefined }) => void,
) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    const keyAreaName = key.split("-")[0] as AreaName;
    if (areaName === keyAreaName) {
      const newStorageData = changes[key]?.newValue;
      const oldStorageData = changes[key]?.oldValue;
      if (newStorageData !== undefined || oldStorageData !== undefined) {
        fn({ newValue: newStorageData, oldValue: oldStorageData });
      }
    }
  });
}

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  type?: TabGroupType;
  icon?: string;
  tabs: chrome.tabs.Tab[];
})[];

async function getTabGroupTreeData() {
  const tabGroups = await chrome.tabGroups.query({});
  const tabs = await chrome.tabs.query({
    windowType: "normal",
  });
  const tabGroupTreeData = tabs.reduce<TabGroupTreeData>(
    (tabGroupTreeData, currentTab) => {
      let url: URL | undefined;
      if (currentTab.url) {
        url = new URL(currentTab.url);
      }
      if (
        url?.hostname === chrome.runtime.id &&
        url?.pathname === "/stubPage.html"
      ) {
        const params = new URLSearchParams(url.search);
        currentTab.title = params.get("title") ?? undefined;
        currentTab.url = params.get("url") ?? undefined;
      }
      const currentTabGroupIndex = tabGroupTreeData.findIndex(
        (tabGroup) => tabGroup.id === currentTab.groupId,
      );
      if (currentTabGroupIndex !== -1) {
        tabGroupTreeData[currentTabGroupIndex].tabs.push(currentTab);
      } else {
        const currentTabGroup = tabGroups.find(
          (tabGroup) => tabGroup.id === currentTab.groupId,
        );
        if (currentTabGroup) {
          (currentTabGroup as TabGroupTreeData[number]).type =
            tabGroupTypes.normal;
          tabGroupTreeData.push({
            ...currentTabGroup,
            tabs: [currentTab],
          });
        }
      }

      return tabGroupTreeData;
    },
    [],
  );
  const ungroupedTabs = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
    windowType: "normal",
    pinned: false,
  });
  ungroupedTabs.forEach((tab) => {
    let url: URL | undefined;
    if (tab.url) {
      url = new URL(tab.url);
    }
    if (
      url?.hostname === chrome.runtime.id &&
      url?.pathname === "/stubPage.html"
    ) {
      const params = new URLSearchParams(url.search);
      tab.title = params.get("title") ?? undefined;
      tab.url = params.get("url") ?? undefined;
    }
  });
  const ungroupedTabGroupCollapsed = await getStorageData<boolean>(
    sessionStorageKeys.ungroupedTabGroupCollapsed,
  );
  if (ungroupedTabs.length) {
    tabGroupTreeData.push({
      id: chrome.tabGroups.TAB_GROUP_ID_NONE,
      type: tabGroupTypes.ungrouped,
      color: null as unknown as chrome.tabGroups.Color,
      windowId: null as unknown as NonNullable<chrome.windows.Window["id"]>,
      title: titles.ungroupedTabGroup,
      icon: "MaterialSymbolsFolderOpenOutlineRounded",
      collapsed: ungroupedTabGroupCollapsed ?? false,
      tabs: ungroupedTabs,
    });
  }
  const pinnedTabs = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
    windowType: "normal",
    pinned: true,
  });
  pinnedTabs.forEach((tab) => {
    let url: URL | undefined;
    if (tab.url) {
      url = new URL(tab.url);
    }
    if (
      url?.hostname === chrome.runtime.id &&
      url?.pathname === "/stubPage.html"
    ) {
      const params = new URLSearchParams(url.search);
      tab.title = params.get("title") ?? undefined;
      tab.url = params.get("url") ?? undefined;
    }
  });
  const pinnedTabGroupCollapsed = await getStorageData<boolean>(
    sessionStorageKeys.pinnedTabGroupCollapsed,
  );
  if (pinnedTabs.length) {
    tabGroupTreeData.unshift({
      id: chrome.tabGroups.TAB_GROUP_ID_NONE,
      type: tabGroupTypes.pinned,
      color: null as unknown as chrome.tabGroups.Color,
      windowId: null as unknown as NonNullable<chrome.windows.Window["id"]>,
      title: titles.pinnedTabGroup,
      icon: "pin",
      collapsed: pinnedTabGroupCollapsed ?? false,
      tabs: pinnedTabs,
    });
  }

  return tabGroupTreeData;
}

async function removeBookmarkNodeChildren(
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  const currentSessionDataChildren =
    await chrome.bookmarks.getChildren(bookmarkNodeId);
  for (const tabGroupData of currentSessionDataChildren) {
    await chrome.bookmarks.removeTree(tabGroupData.id);
  }
}

async function updateCurrentSessionData() {
  const readyToUpdateCurrentSessionData = await getStorageData<boolean>(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
  );
  const currentSessionData =
    await getStorageData<chrome.bookmarks.BookmarkTreeNode>(
      sessionStorageKeys.currentSessionData,
    );
  if (!readyToUpdateCurrentSessionData || !currentSessionData) {
    return;
  }
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    )) ?? [];
  if (tabGroupTreeData.length) {
    await removeBookmarkNodeChildren(currentSessionData.id);
    await saveCurrentSessionDataIntoBookmarkNode(currentSessionData.id);
    const pinnedTabGroupBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
    await removeBookmarkNodeChildren(pinnedTabGroupBookmarkNodeId!);
    if (tabGroupTreeData[0]?.type === tabGroupTypes.pinned) {
      for (const tab of tabGroupTreeData[0].tabs) {
        await chrome.bookmarks.create({
          parentId: pinnedTabGroupBookmarkNodeId,
          title: tab.title,
          url: tab.url,
        });
      }
    }
  }
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    false,
  );
}

async function applyUpdates() {
  navigator.locks.request(lockNames.applyUpdates, async () => {
    const tabGroupTreeData = await getTabGroupTreeData();
    await setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
    await updateCurrentSessionData();
  });
}

export async function updateTabGroupTreeDataAndCurrentSessionData() {
  const debounceTabGroupTreeDataUpdates = await getStorageData<boolean>(
    sessionStorageKeys.debounceTabGroupTreeDataUpdates,
  );
  const tabGroupTreeDataUpdateTimeoutId = await getStorageData<number>(
    sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId,
  );
  if (!debounceTabGroupTreeDataUpdates) {
    applyUpdates();
    await setStorageData(
      sessionStorageKeys.debounceTabGroupTreeDataUpdates,
      true,
    );
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    setStorageData(
      sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId,
      setTimeout(() => {
        setStorageData(
          sessionStorageKeys.debounceTabGroupTreeDataUpdates,
          false,
        );
      }, tabGroupTreeDataUpdateDebounceTimeout),
    );
  } else {
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    setStorageData(
      sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId,
      setTimeout(() => {
        setStorageData(
          sessionStorageKeys.debounceTabGroupTreeDataUpdates,
          false,
        );
        applyUpdates();
      }, tabGroupTreeDataUpdateDebounceTimeout),
    );
  }
}

export async function createBookmarkNodeAndSyncId(
  syncStorageKey: SyncStorageKey,
  bookmarkNodeTitle: string,
) {
  await navigator.locks.request(lockNames.createBookmarkNode, async () => {
    try {
      const bookmarkNodeId =
        await getStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
          syncStorageKey,
        );
      let parentId: chrome.bookmarks.BookmarkTreeNode["id"] | undefined;
      if (syncStorageKey === syncStorageKeys.pinnedTabGroupBookmarkNodeId) {
        parentId = await getStorageData<
          chrome.bookmarks.BookmarkTreeNode["id"]
        >(syncStorageKeys.rootBookmarkNodeId);
      }
      try {
        const bookmarkNode = (await chrome.bookmarks.get(bookmarkNodeId!))[0];
        // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case
        if (!bookmarkNode) {
          const bookmarkNodeId = (
            await chrome.bookmarks.create({
              title: bookmarkNodeTitle,
              parentId,
            })
          ).id;
          setStorageData(syncStorageKey, bookmarkNodeId);
        }
      } catch (error) {
        const bookmarkNodeId = (
          await chrome.bookmarks.create({ title: bookmarkNodeTitle, parentId })
        ).id;
        await setStorageData(syncStorageKey, bookmarkNodeId);
      }
    } catch (error) {
      // no error handling here. we'll do that in the sidepanel ui
    }
  });
}

export async function sendMessage(
  message: { type: MessageType; data?: any },
  fn?: (response: any) => void,
) {
  chrome.runtime.sendMessage(
    {
      type: message.type,
      data: message.data,
    },
    // @ts-ignore. looks like `chrome.runtime.sendMessage` was typed incorrectly
    fn,
  );
}

export function subscribeToMessage(
  messageType: MessageType,
  fn: (
    data: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void,
  ) => void,
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type && message.type === messageType) {
      fn(message.data, sender, sendResponse);
    }

    return true;
  });
}

export async function saveCurrentSessionDataIntoBookmarkNode(
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    )) ?? [];
  for (const tabGroup of tabGroupTreeData) {
    if (tabGroup.type === tabGroupTypes.pinned) {
      continue;
    }
    const tabGroupDataId = (
      await chrome.bookmarks.create({
        parentId: bookmarkNodeId,
        title: tabGroup.icon
          ? tabGroup.title
          : `${tabGroup.color}-${tabGroup.title}`,
      })
    ).id;
    for (const tab of tabGroup.tabs) {
      await chrome.bookmarks.create({
        parentId: tabGroupDataId,
        title: tab.title,
        url: tab.url,
      });
    }
  }
}

export function getFaviconUrl(pageUrl: string | null | undefined) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl ?? "null");
  url.searchParams.set("size", "32");

  return url.toString();
}
