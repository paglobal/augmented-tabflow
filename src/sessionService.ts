import { adaptState } from "promethium-js";
import {
  sessionStorageKeys,
  syncStorageKeys,
  tabGroupTypes,
  ungroupedTabGroupTitle,
} from "../constants";
import { notify, tabGroupColors } from "./utils";
import {
  type TabGroupTreeData,
  getStorageData,
  setStorageData,
  subscribeToStorageData,
  updateTabGroupTreeData,
} from "../sharedUtils";

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(async () => {
  const tabGroupTreeData = await getStorageData<TabGroupTreeData>(
    sessionStorageKeys.tabGroupTreeData,
  );

  return tabGroupTreeData ?? [];
});

subscribeToStorageData<TabGroupTreeData>(
  sessionStorageKeys.tabGroupTreeData,
  ({ newValue }) => {
    if (newValue !== undefined) {
      setTabGroupTreeData(newValue);
    }
  },
);

export function expandTabGroup(tabGroup: TabGroupTreeData[number]) {
  if (tabGroup.type === tabGroupTypes.ungrouped) {
    setStorageData(sessionStorageKeys.ungroupedTabGroupCollapsed, false);
    updateTabGroupTreeData();
  } else if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabGroups.update(tabGroup.id, {
      collapsed: false,
    });
  }
}

export function collapseTabGroup(tabGroup: TabGroupTreeData[number]) {
  if (tabGroup.type === tabGroupTypes.ungrouped) {
    setStorageData(sessionStorageKeys.ungroupedTabGroupCollapsed, true);
    updateTabGroupTreeData();
  } else if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabGroups.update(tabGroup.id, {
      collapsed: true,
    });
  }
}

export async function addTabToTabGroup(tabGroup: TabGroupTreeData[number]) {
  const tab = await chrome.tabs.create({});
  if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabs.group({
      groupId: tabGroup.id,
      tabIds: tab.id as number,
    });
  }
}

export async function closeTabGroup(tabGroup: TabGroupTreeData[number]) {
  const tabIds = tabGroup.tabs.map((tab) => tab.id) as [number, ...number[]];
  await chrome.tabs.ungroup(tabIds);
  tabGroup.tabs.forEach(async (tab) => {
    await chrome.tabs.remove(tab.id as number);
  });
}

export function activateTab(tab: chrome.tabs.Tab) {
  // focus tab window first if it's not already in focus
  if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
    chrome.windows.update(tab.windowId, { focused: true });
  }
  chrome.tabs.update(tab.id as number, { active: true });
}

export async function groupUngroupedTabsInWindow() {
  const ungroupedTabs = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
    currentWindow: true,
  });
  if (ungroupedTabs.length > 0) {
    const tabIds = ungroupedTabs.map((tab) => tab.id) as [number, ...number[]];
    chrome.tabs.group({ tabIds });
  } else {
    notify("No ungrouped tabs in this window", "warning");
  }
}

export async function createTabGroup(options: {
  title: chrome.tabGroups.TabGroup["title"];
  color: chrome.tabGroups.Color;
}) {
  const tab = await chrome.tabs.create({
    active: true,
  });
  const groupId = await chrome.tabs.group({ tabIds: tab.id as number });
  chrome.tabGroups.update(groupId, options);
}

export function updateTabGroup(
  tabId: chrome.tabGroups.TabGroup["id"] | null,
  options: {
    title: chrome.tabGroups.TabGroup["title"];
    color: chrome.tabGroups.Color;
  },
) {
  if (tabId) {
    chrome.tabGroups.update(tabId, {
      title: options.title,
      color: options.color,
    });
  }
}

// don't subscribe to storage updates for this state. it seems to cause/trigger bugs in the `sl-tree` component. plus we don't need to because we create a new window anyways
export const [currentSessionData, setCurrentSessionData] = adaptState<
  | Promise<chrome.bookmarks.BookmarkTreeNode | undefined | null>
  | chrome.bookmarks.BookmarkTreeNode
  | undefined
  | null
>(async () => {
  const currentSessionData =
    await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
      sessionStorageKeys.currentSessionData,
    );

  return currentSessionData;
});

export const [sessionsTreeData, setSessionsTreeData] = adaptState<
  | chrome.bookmarks.BookmarkTreeNode[]
  | Promise<chrome.bookmarks.BookmarkTreeNode[]>
>(async () => {
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    // not a typo. there's a difference between `sessionsData` and `sessionData`
    const sessionsData = (
      await chrome.bookmarks.getChildren(rootBookmarkNodeId)
    ).filter(async (tabGroupData) => {
      if (tabGroupData.url) {
        await chrome.bookmarks.remove(tabGroupData.id);

        return false;
      }

      return true;
    });

    return sessionsData ?? [];
  } else {
    return [];
  }
});

async function updateSessionsTreeData() {
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    const sessionDataChildren = (
      await chrome.bookmarks.getChildren(rootBookmarkNodeId)
    ).filter(async (tabGroupData) => {
      if (tabGroupData.url) {
        await chrome.bookmarks.remove(tabGroupData.id);

        return false;
      }

      return true;
    });
    setSessionsTreeData(sessionDataChildren);
  }
}

chrome.bookmarks.onChanged.addListener(() => {
  updateSessionsTreeData();
});
chrome.bookmarks.onChildrenReordered.addListener(() => {
  updateSessionsTreeData();
});
chrome.bookmarks.onCreated.addListener(() => {
  updateSessionsTreeData();
});
chrome.bookmarks.onMoved.addListener(() => {
  updateSessionsTreeData();
});
chrome.bookmarks.onRemoved.addListener(() => {
  updateSessionsTreeData();
});

export async function createSession(
  title: string,
  saveCurrentSession?: boolean,
) {
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  const session = (
    await chrome.bookmarks.create({ parentId: rootBookmarkNodeId, title })
  ).id;
  if (saveCurrentSession) {
    const tabGroupTreeData = await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    );
    if (tabGroupTreeData) {
      for (const tabGroup of tabGroupTreeData) {
        const tabGroupDataId = (
          await chrome.bookmarks.create({
            parentId: session,
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
  }
  notify("Session created successfully", "success");
}

export async function updateSessionTitle(
  sesssionIdOrIsCurrentSession: chrome.bookmarks.BookmarkTreeNode["id"] | true,
  title: string,
) {
  if (sesssionIdOrIsCurrentSession === true) {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );
    if (currentSessionData) {
      await chrome.bookmarks.update(currentSessionData.id, { title });
    } else {
      notify("Session does not exist", "danger");
    }
  } else if (typeof sesssionIdOrIsCurrentSession === "string") {
    await chrome.bookmarks.update(sesssionIdOrIsCurrentSession, { title });
  }
}

export async function deleteSession(
  sessionId: chrome.bookmarks.BookmarkTreeNode["id"],
  isCurrentSession?: boolean,
) {
  await chrome.bookmarks.removeTree(sessionId);
  if (isCurrentSession) {
    await openNewSession(null);
  }
}

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

async function createSessionWindowAndGroupTabs(
  tabUrls: chrome.tabs.Tab["url"][],
  tabGroupingData: TabGroupingData,
) {
  const window = await chrome.windows.create({
    focused: true,
    url: tabUrls as string[],
  });
  await chrome.sidePanel.open({ windowId: window?.id });
  const sessionTabs = await chrome.tabs.query({ windowId: window?.id });
  tabGroupingData.forEach(async (data) => {
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
      title,
      color,
      collapsed: true,
    });
  });

  return window?.id;
}

async function initSessionTabs(
  sessionId?: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  let windowId: chrome.windows.Window["id"] | undefined = undefined;
  if (sessionId !== undefined) {
    const sessionData = (await chrome.bookmarks.getSubTree(sessionId))[0];
    const tabUrls: chrome.tabs.Tab["url"][] = [];
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
      if (!tabGroupColors()[tabGroupColor] && !isUngroupedTabGroupData) {
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
          tabUrls.push(tabData.url);
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
    windowId = await createSessionWindowAndGroupTabs(tabUrls, tabGroupingData);
  } else {
    const previousUnsavedSessionTabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
      )) ?? [];
    const tabUrls: chrome.tabs.Tab["url"][] = [];
    const tabGroupingData: TabGroupingData = [];
    let currentIndex = 0;
    for (const tabGroup of previousUnsavedSessionTabGroupTreeData) {
      const { title, color } = tabGroup;
      const isUngroupedTabGroupData =
        tabGroup.id === chrome.tabGroups.TAB_GROUP_ID_NONE;
      const startIndex = currentIndex;
      for (const tab of tabGroup.tabs) {
        tabUrls.push(tab.url);
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
    windowId = await createSessionWindowAndGroupTabs(tabUrls, tabGroupingData);
  }

  return windowId;
}

export async function openNewSession(
  newSessionData: chrome.bookmarks.BookmarkTreeNode | null,
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
  const newSessionWindowId = await initSessionTabs(newSessionData?.id);
  await closePreviousSession(newSessionWindowId);
}
