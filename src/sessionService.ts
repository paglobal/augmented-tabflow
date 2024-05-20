import { adaptState } from "promethium-js";
import {
  messageTypes,
  sessionStorageKeys,
  syncStorageKeys,
  tabGroupTypes,
  titles,
} from "../constants";
import { notify, notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  type TabGroupTreeData,
  getStorageData,
  setStorageData,
  subscribeToStorageData,
  updateTabGroupTreeDataAndCurrentSessionData,
  sendMessage,
  saveCurrentSessionDataIntoBookmarkNode,
} from "../sharedUtils";
import {
  currentlyEjectedTabOrTabGroup,
  currentlyMovedOrCopiedTabOrTabGroup,
  deleteSessionDialogRef,
  firstTabInNewTabGroup,
  sessionWindowsTreeDialogRef,
  sessionsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEjectedTabOrTabGroup,
  setFirstTabInNewTabGroup,
} from "./App";

export const [tabGroupTreeData, setTabGroupTreeData] =
  adaptState<TabGroupTreeData>([]);

updateTabGroupTreeData();

async function updateTabGroupTreeData(tabGroupTreeData?: TabGroupTreeData) {
  if (tabGroupTreeData === undefined) {
    tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData,
      )) ?? [];
  }
  // filter out any tabs or tab groups that are not in this window
  const currentWindowId = (await chrome.windows.getCurrent()).id;
  tabGroupTreeData.forEach((tabGroup) => {
    if (!tabGroup.windowId) {
      tabGroup.tabs = tabGroup.tabs.filter(
        (tab) => !(tab.windowId !== currentWindowId),
      );
    }
  });
  tabGroupTreeData = tabGroupTreeData.filter(
    (tabGroup) =>
      !(tabGroup.windowId && tabGroup.windowId !== currentWindowId) &&
      tabGroup.tabs.length,
  );
  setTabGroupTreeData(tabGroupTreeData);
}

subscribeToStorageData<TabGroupTreeData>(
  sessionStorageKeys.tabGroupTreeData,
  async ({ newValue: tabGroupTreeData }) => {
    // @error
    tabGroupTreeData = tabGroupTreeData ?? [];
    updateTabGroupTreeData(tabGroupTreeData);
  },
);

export async function expandTabGroup(tabGroup: TabGroupTreeData[number]) {
  // @maybe
  if (tabGroup.type === tabGroupTypes.ungrouped) {
    await setStorageData(sessionStorageKeys.ungroupedTabGroupCollapsed, false);
    await updateTabGroupTreeDataAndCurrentSessionData();
  } else if (tabGroup.type === tabGroupTypes.pinned) {
    await setStorageData(sessionStorageKeys.pinnedTabGroupCollapsed, false);
    await updateTabGroupTreeDataAndCurrentSessionData();
  } else if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabGroups.update(tabGroup.id, {
      collapsed: false,
    });
  }
}

export async function collapseTabGroup(tabGroup: TabGroupTreeData[number]) {
  // @maybe
  if (tabGroup.type === tabGroupTypes.ungrouped) {
    await setStorageData(sessionStorageKeys.ungroupedTabGroupCollapsed, true);
    await updateTabGroupTreeDataAndCurrentSessionData();
  } else if (tabGroup.type === tabGroupTypes.pinned) {
    await setStorageData(sessionStorageKeys.pinnedTabGroupCollapsed, true);
    await updateTabGroupTreeDataAndCurrentSessionData();
  } else if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabGroups.update(tabGroup.id, {
      collapsed: true,
    });
  }
}

export async function addTabToTabGroup(tabGroup: TabGroupTreeData[number]) {
  // @maybe
  const tab = await chrome.tabs.create({
    pinned: tabGroup.type === tabGroupTypes.pinned ? true : false,
  });
  if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabs.group({
      groupId: tabGroup.id,
      tabIds: tab.id as number,
    });
  }
}

export async function closeTabGroup(tabGroup: TabGroupTreeData[number]) {
  // @maybe
  const tabIds = tabGroup.tabs.map((tab) => tab.id) as [number, ...number[]];
  await chrome.tabs.ungroup(tabIds);
  tabGroup.tabs.forEach(async (tab) => {
    await chrome.tabs.remove(tab.id as number);
  });
}

export function activateTab(tab: chrome.tabs.Tab) {
  // @maybe
  // focus tab window first if it's not already in focus
  if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
    chrome.windows.update(tab.windowId, { focused: true });
  }
  chrome.tabs.update(tab.id as number, { active: true });
}

export async function groupUngroupedTabsInWindow() {
  // @maybe
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
  // @maybe
  let _firstTabInNewTabGroup = firstTabInNewTabGroup();
  if (!_firstTabInNewTabGroup) {
    _firstTabInNewTabGroup = await chrome.tabs.create({ active: false });
  }
  const groupId = await chrome.tabs.group({
    tabIds: _firstTabInNewTabGroup.id as number,
    createProperties: {
      windowId: _firstTabInNewTabGroup.windowId,
    },
  });
  await chrome.tabGroups.update(groupId, options);
  await chrome.tabs.update(_firstTabInNewTabGroup.id!, { active: true });
  setFirstTabInNewTabGroup(null);
}

export function updateTabGroup(
  tabId: chrome.tabGroups.TabGroup["id"] | null,
  options: {
    title: chrome.tabGroups.TabGroup["title"];
    color: chrome.tabGroups.Color;
  },
) {
  // @maybe
  if (tabId) {
    chrome.tabGroups.update(tabId, {
      title: options.title,
      color: options.color,
    });
  }
}

export const currentSessionDataNotAvailable = Symbol(
  "currentSessionDataNotAvailable",
);
export const [currentSessionData, setCurrentSessionData] = adaptState<
  | chrome.bookmarks.BookmarkTreeNode
  | null
  | typeof currentSessionDataNotAvailable
>(currentSessionDataNotAvailable);

updateCurrentSessionData();

async function updateCurrentSessionData(
  currentSessionData?: chrome.bookmarks.BookmarkTreeNode | null,
) {
  if (currentSessionData === undefined) {
    currentSessionData =
      (await getStorageData<chrome.bookmarks.BookmarkTreeNode>(
        sessionStorageKeys.currentSessionData,
      )) ?? null;
  }
  setCurrentSessionData(currentSessionData);
}

subscribeToStorageData<chrome.bookmarks.BookmarkTreeNode>(
  sessionStorageKeys.currentSessionData,
  ({ newValue: currentSessionData }) => {
    // @error
    if (currentSessionData !== undefined) {
      updateCurrentSessionData(currentSessionData);
    }
  },
);

export const [sessionLoading, setSessionLoading] = adaptState<boolean>(false);
updateSessionLoading();

async function updateSessionLoading(sessionLoading?: boolean) {
  if (sessionLoading === undefined) {
    sessionLoading =
      (await getStorageData<boolean>(sessionStorageKeys.sessionLoading)) ??
      false;
  }
  console.log(sessionLoading);
  setSessionLoading(sessionLoading);
}

subscribeToStorageData<boolean>(
  sessionStorageKeys.sessionLoading,
  ({ newValue: sessionLoading }) => {
    // @error
    sessionLoading = sessionLoading ?? false;
    updateSessionLoading(sessionLoading);
  },
);

export const [sessionsTreeData, setSessionsTreeData] = adaptState<
  chrome.bookmarks.BookmarkTreeNode[]
>([]);

updateSessionsTreeData();

async function updateSessionsTreeData(
  bookmarkIdOrBookmarkInfo?:
    | chrome.bookmarks.BookmarkTreeNode["id"]
    | { parentId?: chrome.bookmarks.BookmarkTreeNode["id"] },
) {
  // @error
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (bookmarkIdOrBookmarkInfo) {
    if (typeof bookmarkIdOrBookmarkInfo === "string") {
      try {
        const bookmark = (
          await chrome.bookmarks.get(bookmarkIdOrBookmarkInfo)
        )[0];
        if (bookmark.parentId !== rootBookmarkNodeId) {
          return;
        }
      } catch (error) {
        return;
      }
    } else {
      if (bookmarkIdOrBookmarkInfo.parentId !== rootBookmarkNodeId) {
        return;
      }
    }
  }
  const pinnedTabGroupBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
  if (rootBookmarkNodeId && pinnedTabGroupBookmarkNodeId) {
    const sessionsDataChildren = (
      await chrome.bookmarks.getChildren(rootBookmarkNodeId)
    ).filter((sessionData) => {
      if (sessionData.url) {
        chrome.bookmarks.remove(sessionData.id);

        return false;
      }
      if (sessionData.id === pinnedTabGroupBookmarkNodeId) {
        return false;
      }

      return true;
    });
    setSessionsTreeData(sessionsDataChildren);
  } else {
    notifyWithErrorMessageAndReloadButton();
  }
}

chrome.bookmarks.onCreated.addListener((_, bookmark) => {
  // @handled
  try {
    updateSessionsTreeData(bookmark);
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onChanged.addListener((bookmarkId) => {
  // @handled
  try {
    updateSessionsTreeData(bookmarkId);
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onMoved.addListener((bookmarkId) => {
  // @handled
  try {
    updateSessionsTreeData(bookmarkId);
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onRemoved.addListener((_, removeInfo) => {
  // @handled
  try {
    updateSessionsTreeData(removeInfo);
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

export async function createSession(
  title: string,
  useCurrentSessionData?: boolean,
) {
  // @maybe
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    const sessionData = await chrome.bookmarks.create({
      title,
      parentId: rootBookmarkNodeId,
    });
    await chrome.bookmarks.create({
      title: titles.ungroupedTabGroup,
      parentId: sessionData.id,
    });
    if (useCurrentSessionData) {
      await saveCurrentSessionDataIntoBookmarkNode(sessionData.id);
    }
  } else {
    notifyWithErrorMessageAndReloadButton();
  }
}

export async function updateSessionTitle(
  sesssionIdOrIsCurrentSession: chrome.bookmarks.BookmarkTreeNode["id"] | true,
  title: string,
) {
  // @maybe
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
}

export async function deleteSession(
  sessionId: chrome.bookmarks.BookmarkTreeNode["id"],
  isCurrentSession?: boolean,
) {
  // @maybe
  await chrome.bookmarks.removeTree(sessionId);
  if (isCurrentSession) {
    await openNewSession(null);
  }
  deleteSessionDialogRef.value?.hide();
}

export async function openNewSession(
  newSessionData: chrome.bookmarks.BookmarkTreeNode | null,
) {
  // @maybe
  sessionsTreeDialogRef.value?.hide();
  sendMessage({ type: messageTypes.openNewSession, data: newSessionData });
}

export async function moveOrCopyToSession(
  sessionOrTabGroupDataId: chrome.bookmarks.BookmarkTreeNode["id"],
  copy: boolean = false,
) {
  // @maybe
  const _currentlyMovedOrCopiedTabOrTabGroup =
    currentlyMovedOrCopiedTabOrTabGroup();
  if (!_currentlyMovedOrCopiedTabOrTabGroup) {
    return;
  }
  if ((_currentlyMovedOrCopiedTabOrTabGroup as chrome.tabs.Tab).url) {
    await chrome.bookmarks.create({
      parentId: sessionOrTabGroupDataId,
      url: (_currentlyMovedOrCopiedTabOrTabGroup as chrome.tabs.Tab).url,
      title: _currentlyMovedOrCopiedTabOrTabGroup.title,
    });
    if (copy === false) {
      notify("Tab copied successfully.", "success");
    } else {
      await chrome.tabs.remove(_currentlyMovedOrCopiedTabOrTabGroup.id!);
      notify("Tab moved successfully.", "success");
    }
  } else if (
    (_currentlyMovedOrCopiedTabOrTabGroup as TabGroupTreeData[number]).tabs
  ) {
    const tabGroupData = await chrome.bookmarks.create({
      parentId: sessionOrTabGroupDataId,
      title: `${
        (_currentlyMovedOrCopiedTabOrTabGroup as TabGroupTreeData[number]).color
      }-${_currentlyMovedOrCopiedTabOrTabGroup.title}`,
    });
    const tabs = await chrome.tabs.query({
      groupId: _currentlyMovedOrCopiedTabOrTabGroup.id,
    });
    const tabIds = tabs.map((tab) => tab.id);
    for (const tab of tabs) {
      await chrome.bookmarks.create({
        parentId: tabGroupData.id,
        url: tab.url,
        title: tab.title,
      });
    }
    if (copy) {
      notify("Tab group copied successfully.", "success");
    } else {
      await chrome.tabs.ungroup(tabIds as [number, ...number[]]);
      await chrome.tabs.remove(tabIds as number[]);
      notify("Tab group moved successfully.", "success");
    }
  }
  setCurrentMovedOrCopiedTabOrTabGroup(null);
}

export async function moveTabOrTabGroupToWindow(
  windowId?: chrome.windows.Window["id"],
) {
  sendMessage({
    type: messageTypes.moveTabOrTabGroupToWindow,
    data: {
      currentlyEjectedTabOrTabGroup: currentlyEjectedTabOrTabGroup(),
      windowId,
    },
  });
  setCurrentlyEjectedTabOrTabGroup(null);
  sessionWindowsTreeDialogRef.value?.hide();
}
