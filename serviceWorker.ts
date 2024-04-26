import {
  initialTabUrlBeginning,
  initialTabUrlSeparatingStub,
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
  subscribeToStorageData,
  saveCurrentSessionData,
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
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabGroups.onRemoved.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabGroups.onUpdated.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

async function restoreTabIfBlank(tabId: NonNullable<chrome.tabs.Tab["id"]>) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.url) {
    tab.url = decodeURIComponent(tab.url);
  }
  if (
    tab.url?.startsWith(
      `${initialTabUrlBeginning}${initialTabUrlSeparatingStub}`,
    )
  ) {
    const currentTabInitialUrlSegments = tab.url.split(
      `${initialTabUrlSeparatingStub}`,
    );
    await chrome.tabs.update(tabId, {
      url: currentTabInitialUrlSegments[2],
    });
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await restoreTabIfBlank(activeInfo.tabId);
  await updateTabGroupTreeData();
});

chrome.tabs.onAttached.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onCreated.addListener(async () => {
  console.log("created!");
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onDetached.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onRemoved.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onReplaced.addListener(async () => {
  await setStorageData(
    sessionStorageKeys.prepareToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeData();
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
  if (changeInfo.title || changeInfo.url) {
    await setStorageData(
      sessionStorageKeys.prepareToUpdateCurrentSessionData,
      true,
    );
  }
  await updateTabGroupTreeData();
});

async function closePreviousSession(
  newSessionWindowId: chrome.windows.Window["id"],
) {
  const normalWindows = await chrome.windows.getAll({
    windowTypes: ["normal"],
  });
  normalWindows.forEach(async (window) => {
    if (window.id !== undefined && window.id !== newSessionWindowId) {
      await chrome.windows.remove(window.id);
    }
  });
}

type TabGroupingData = {
  title?: string;
  color?: chrome.tabGroups.Color;
  startIndex: number;
  endIndex: number;
}[];

type TabUrlsAndTitles = {
  url: chrome.tabs.Tab["url"];
  title: chrome.tabs.Tab["title"];
}[];

async function createSessionWindowAndGroupTabs(
  tabUrlsAndTitles: TabUrlsAndTitles,
  tabGroupingData: TabGroupingData,
) {
  const tabUrls = tabUrlsAndTitles.map((entry, index) => {
    if (index === 0) {
      return entry.url;
    }

    return `${initialTabUrlBeginning}${initialTabUrlSeparatingStub}${entry.title}${initialTabUrlSeparatingStub}${entry.url}`;
  });
  const window = await chrome.windows.create({
    focused: false,
    url: tabUrls as string[],
  });
  const sessionTabs = await chrome.tabs.query({ windowId: window?.id });
  tabGroupingData.forEach(async (data, index) => {
    const tabIds: chrome.tabs.Tab["id"][] = [];
    const { title, color, startIndex, endIndex } = data;
    for (let i = startIndex; i < endIndex; i++) {
      const tab = sessionTabs[i];
      tabIds.push(tab.id);
    }
    const tabGroupId = await chrome.tabs.group({
      tabIds: tabIds as [number, ...number[]],
      createProperties: {
        windowId: window?.id,
      },
    });
    await chrome.tabGroups.update(tabGroupId, {
      color,
      collapsed: index === 0 ? false : true,
      title,
    });
  });

  return window?.id;
}

async function initSessionTabs(
  newSessionData?: chrome.bookmarks.BookmarkTreeNode,
) {
  const oldSessionData =
    await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
      sessionStorageKeys.currentSessionData,
    );
  if (!oldSessionData) {
    const tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData,
      )) ?? [];
    await setStorageData<TabGroupTreeData>(
      sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
      tabGroupTreeData,
    );
  }
  await setStorageData(sessionStorageKeys.currentSessionData, newSessionData);
  await setStorageData(sessionStorageKeys.ungroupedTabGroupCollapsed, false);
  await setStorageData(
    sessionStorageKeys.recentlyClosedTabGroupsCollapsed,
    true,
  );
  await setStorageData(sessionStorageKeys.recentlyClosedTabGroups, []);
  let windowId: chrome.windows.Window["id"] | undefined = undefined;
  if (newSessionData) {
    const sessionData = (
      await chrome.bookmarks.getSubTree(newSessionData.id)
    )[0];
    const tabUrlsAndTitles: TabUrlsAndTitles = [];
    const tabGroupingData: TabGroupingData = [];
    let currentIndex = 0;
    for (const tabGroupData of sessionData.children ?? []) {
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
      const startIndex = currentIndex;
      for (const tabData of tabGroupData.children ?? []) {
        if (tabData.children) {
          await chrome.bookmarks.removeTree(tabData.id);

          continue;
        }
        if (tabData.url) {
          tabUrlsAndTitles.push({ url: tabData.url, title: tabData.title });
          currentIndex++;
        }
      }
      const endIndex = currentIndex;
      if (!isUngroupedTabGroupData) {
        const tabGroupTitle = tabGroupData.title.split("-").slice(1).join("-");
        tabGroupingData.push({
          title: tabGroupTitle,
          color: tabGroupColor,
          startIndex,
          endIndex,
        });
      }
    }
    windowId = await createSessionWindowAndGroupTabs(
      tabUrlsAndTitles,
      tabGroupingData,
    );
  } else {
    const previousUnsavedSessionTabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
      )) ?? [];
    const tabUrlsAndTitles: TabUrlsAndTitles = [];
    const tabGroupingData: TabGroupingData = [];
    let currentIndex = 0;
    for (const tabGroup of previousUnsavedSessionTabGroupTreeData) {
      const { title, color } = tabGroup;
      const isUngroupedTabGroupData =
        tabGroup.id === chrome.tabGroups.TAB_GROUP_ID_NONE;
      const startIndex = currentIndex;
      for (const tab of tabGroup.tabs) {
        tabUrlsAndTitles.push({ url: tab.url, title: tab.title });
        currentIndex++;
      }
      const endIndex = currentIndex;
      if (!isUngroupedTabGroupData) {
        tabGroupingData.push({
          title,
          color,
          startIndex,
          endIndex,
        });
      }
    }
    windowId = await createSessionWindowAndGroupTabs(
      tabUrlsAndTitles,
      tabGroupingData,
    );
  }

  return windowId;
}

subscribeToMessage(
  messageTypes.initSessionTabs,
  async (newSessionData, sendResponse) => {
    const windowId = await initSessionTabs(newSessionData);
    sendResponse(windowId);
  },
);

subscribeToStorageData<chrome.windows.Window["id"]>(
  sessionStorageKeys.readyToClosePreviousSession,
  async ({ newValue }) => {
    if (newValue !== null) {
      await closePreviousSession(newValue);
      await chrome.windows.update(newValue!, { focused: true });
      await setStorageData(
        sessionStorageKeys.readyToClosePreviousSession,
        null,
      );
    }
  },
);

async function updateCurrentSessionData() {
  const updateCurrentSessionData = await getStorageData<boolean>(
    sessionStorageKeys.updateCurrentSessionData,
  );
  const currentSessionData =
    await getStorageData<chrome.bookmarks.BookmarkTreeNode>(
      sessionStorageKeys.currentSessionData,
    );
  if (!updateCurrentSessionData || !currentSessionData) {
    return;
  }
  console.log("here too!");
  await chrome.bookmarks.removeTree(currentSessionData.id);
  const newSessionData = await saveCurrentSessionData(currentSessionData);
  await setStorageData(sessionStorageKeys.currentSessionData, newSessionData);
  await setStorageData(sessionStorageKeys.updateCurrentSessionData, false);
}

subscribeToStorageData<boolean>(
  sessionStorageKeys.updateCurrentSessionData,
  ({ newValue }) => {
    console.log("here boys!");
    if (newValue) {
      console.log("here again!");
      updateCurrentSessionData();
    }
  },
);
