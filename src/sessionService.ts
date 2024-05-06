import { adaptState } from "promethium-js";
import {
  messageTypes,
  sessionStorageKeys,
  syncStorageKeys,
  tabGroupTypes,
} from "../constants";
import { notify, notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  type TabGroupTreeData,
  getStorageData,
  setStorageData,
  subscribeToStorageData,
  updateTabGroupTreeData,
  sendMessage,
  saveCurrentSessionData,
} from "../sharedUtils";

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(async () => {
  // @error
  const tabGroupTreeData = await getStorageData<TabGroupTreeData>(
    sessionStorageKeys.tabGroupTreeData,
  );

  return tabGroupTreeData ?? [];
});

subscribeToStorageData<TabGroupTreeData>(
  sessionStorageKeys.tabGroupTreeData,
  ({ newValue }) => {
    if (newValue) {
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

export const [currentSessionData, setCurrentSessionData] = adaptState<
  | Promise<chrome.bookmarks.BookmarkTreeNode | undefined | null>
  | chrome.bookmarks.BookmarkTreeNode
  | undefined
  | null
  | ""
>(async () => {
  // @error
  const currentSessionData =
    await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
      sessionStorageKeys.currentSessionData,
    );

  return currentSessionData;
});

subscribeToStorageData(
  sessionStorageKeys.currentSessionData,
  ({ oldValue }) => {
    if (oldValue === null || oldValue === "") {
      location.reload();
    }
  },
);

export const [sessionsTreeData, setSessionsTreeData] = adaptState<
  | chrome.bookmarks.BookmarkTreeNode[]
  | Promise<chrome.bookmarks.BookmarkTreeNode[]>
>(async () => {
  // @error
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
  // @errorConsider
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    const sessionsDataChildren = (
      await chrome.bookmarks.getChildren(rootBookmarkNodeId)
    ).filter(async (tabGroupData) => {
      if (tabGroupData.url) {
        await chrome.bookmarks.remove(tabGroupData.id);

        return false;
      }

      return true;
    });
    setSessionsTreeData(sessionsDataChildren);
  }
}

chrome.bookmarks.onCreated.addListener(() => {
  updateSessionsTreeData();
});

chrome.bookmarks.onChanged.addListener(() => {
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
  useCurrentSessionData?: boolean,
) {
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    if (useCurrentSessionData) {
      await saveCurrentSessionData({ title, parentId: rootBookmarkNodeId });
    } else {
      await chrome.bookmarks.create({ title, parentId: rootBookmarkNodeId });
    }
    notify("Session created successfully", "success");
    location.reload();
  } else {
    notifyWithErrorMessageAndReloadButton();
  }
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
      const newSessionData = await chrome.bookmarks.update(
        currentSessionData.id,
        { title },
      );
      await setStorageData(
        sessionStorageKeys.currentSessionData,
        newSessionData,
      );
    } else {
      notify("Session does not exist", "danger");

      return;
    }
  } else if (typeof sesssionIdOrIsCurrentSession === "string") {
    await chrome.bookmarks.update(sesssionIdOrIsCurrentSession, { title });
  }
  location.reload();
}

export async function deleteSession(
  sessionId: chrome.bookmarks.BookmarkTreeNode["id"],
  isCurrentSession?: boolean,
) {
  await chrome.bookmarks.removeTree(sessionId);
  if (isCurrentSession) {
    await openNewSession(null);
  } else {
    location.reload();
  }
}

export async function openNewSession(
  newSessionData: chrome.bookmarks.BookmarkTreeNode | null,
) {
  sendMessage({ type: messageTypes.initSessionTabs, data: newSessionData });
}
