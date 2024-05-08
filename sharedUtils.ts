import {
  type SyncStorageKey,
  type SessionStorageKey,
  syncStorageKeys,
  rootBookmarkNodeTitle,
  AreaName,
  TabGroupType,
  tabGroupTypes,
  sessionStorageKeys,
  ungroupedTabGroupTitle,
  MessageType,
  tabGroupTreeDataUpdateDebounceTimeout,
  applyUpdatesLockName,
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
      if (url?.hostname === chrome.runtime.id) {
        const params = new URLSearchParams(url.search);
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
  });
  ungroupedTabs.forEach((tab) => {
    let url: URL | undefined;
    if (tab.url) {
      url = new URL(tab.url);
    }
    if (url?.hostname === chrome.runtime.id) {
      const params = new URLSearchParams(url.search);
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
      title: ungroupedTabGroupTitle,
      icon: "folder2-open",
      collapsed: !!ungroupedTabGroupCollapsed,
      tabs: ungroupedTabs,
    });
  }

  return tabGroupTreeData;
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
  const newSessionData = await saveCurrentSessionData(currentSessionData);
  if (newSessionData) {
    await chrome.bookmarks.removeTree(currentSessionData.id);
    await setStorageData(sessionStorageKeys.currentSessionData, newSessionData);
  }
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    false,
  );
}

async function applyUpdates() {
  navigator.locks.request(applyUpdatesLockName, async () => {
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

export async function createRootBookmarkNode() {
  try {
    const rootBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.rootBookmarkNodeId);
    try {
      const rootBookmarkNode = (
        await chrome.bookmarks.get(rootBookmarkNodeId!)
      )[0];
      // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case!
      if (!rootBookmarkNode) {
        const rootBookmarkNodeId = (
          await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
        ).id;
        setStorageData(syncStorageKeys.rootBookmarkNodeId, rootBookmarkNodeId);
      }
    } catch (error) {
      const rootBookmarkNodeId = (
        await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
      ).id;
      await setStorageData(
        syncStorageKeys.rootBookmarkNodeId,
        rootBookmarkNodeId,
      );
    }
  } catch (error) {
    // no error handling here. we'll do that in the sidepanel ui
  }
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
  fn: (data: any, sendResponse: (response: any) => void) => void,
) {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message?.type && message.type === messageType) {
      fn(message.data, sendResponse);
    }

    return true;
  });
}

export async function saveCurrentSessionData(sessionData: {
  title?: chrome.bookmarks.BookmarkTreeNode["title"];
  parentId?: chrome.bookmarks.BookmarkTreeNode["id"];
  index?: chrome.bookmarks.BookmarkTreeNode["index"];
}) {
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    )) ?? [];
  if (tabGroupTreeData.length) {
    const newSessionData = await chrome.bookmarks.create({
      index: sessionData.index,
      parentId: sessionData.parentId,
      title: sessionData.title,
    });
    for (const tabGroup of tabGroupTreeData) {
      const tabGroupDataId = (
        await chrome.bookmarks.create({
          parentId: newSessionData.id,
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

    return newSessionData;
  }
}

export function getFaviconUrl(pageUrl: string | null | undefined) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl ?? "null");
  url.searchParams.set("size", "32");

  return url.toString();
}
