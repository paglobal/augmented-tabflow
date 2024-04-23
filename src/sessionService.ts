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
  closePreviousSession,
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
    setTabGroupTreeData(newValue);
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

export const [currentSessionId, setCurrentSessionId] = adaptState<
  chrome.bookmarks.BookmarkTreeNode["id"] | null | undefined
>(null);

async function updateCurrentSessionId(
  newSessionId?: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  if (newSessionId) {
    setCurrentSessionId(newSessionId);
  } else {
    const currentSessionId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(sessionStorageKeys.currentSessionId);
    setCurrentSessionId(currentSessionId);
  }
}

updateCurrentSessionId();

subscribeToStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
  sessionStorageKeys.currentSessionId,
  ({ newValue }) => {
    setCurrentSessionId(newValue);
  },
);

export const [sessionTreeData, setSessionTreeData] = adaptState<
  | chrome.bookmarks.BookmarkTreeNode[]
  | Promise<chrome.bookmarks.BookmarkTreeNode[]>
>(async () => {
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

    return sessionDataChildren ?? [];
  } else {
    return [];
  }
});

async function updateSessionTreeData() {
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
    setSessionTreeData(sessionDataChildren);
  }
}

chrome.bookmarks.onChanged.addListener(() => {
  updateSessionTreeData();
});
chrome.bookmarks.onChildrenReordered.addListener(() => {
  updateSessionTreeData();
});
chrome.bookmarks.onCreated.addListener(() => {
  updateSessionTreeData();
});
chrome.bookmarks.onMoved.addListener(() => {
  updateSessionTreeData();
});
chrome.bookmarks.onRemoved.addListener(() => {
  updateSessionTreeData();
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
    const currentSessionId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(sessionStorageKeys.currentSessionId);
    if (currentSessionId) {
      await chrome.bookmarks.update(currentSessionId, { title });
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
    await setStorageData(sessionStorageKeys.currentSessionId, undefined);
  }
}
