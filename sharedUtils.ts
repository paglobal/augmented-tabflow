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
} from "./constants";

export async function getStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
  value: T | undefined,
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
      collapsed: ungroupedTabGroupCollapsed ?? true,
      tabs: ungroupedTabs,
    });
  }

  return tabGroupTreeData;
}

async function applyUpdates() {
  const tabGroupTreeData = await getTabGroupTreeData();
  setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
}

export async function updateTabGroupTreeData() {
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
      }, 200),
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
      }, 200),
    );
  }
}

export async function createRootBookmarkNode() {
  try {
    const rootBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.rootBookmarkNodeId);
    try {
      if (rootBookmarkNodeId) {
        const rootBookmarkNode = (
          await chrome.bookmarks.get(rootBookmarkNodeId)
        )[0];
        // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case!
        if (!rootBookmarkNode) {
          const rootBookmarkNodeId = (
            await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
          ).id;
          setStorageData(
            syncStorageKeys.rootBookmarkNodeId,
            rootBookmarkNodeId,
          );
        }
      }
    } catch (e) {
      const rootBookmarkNodeId = (
        await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
      ).id;
      setStorageData(syncStorageKeys.rootBookmarkNodeId, rootBookmarkNodeId);
    }
  } catch (e) {
    // no error handling here. we'll do that in the sidepanel ui
  }
}
