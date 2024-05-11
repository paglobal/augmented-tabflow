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
  updateTabGroupTreeDataAndCurrentSessionData,
  sendMessage,
  saveCurrentSessionDataIntoBookmarkNode,
} from "../sharedUtils";
import {
  currentlyEjectedTabOrTabGroup,
  currentlyMovedOrCopiedTabOrTabGroup,
  moveOrCopyTabGroupToSessionTreeDialogRef,
  sessionWindowsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEjectedTabOrTabGroup,
} from "./App";

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(async () => {
  // @handled
  try {
    const tabGroupTreeData = await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    );

    return tabGroupTreeData ?? [];
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();

    return [];
  }
});

subscribeToStorageData<TabGroupTreeData>(
  sessionStorageKeys.tabGroupTreeData,
  ({ newValue }) => {
    // @error
    if (newValue) {
      setTabGroupTreeData(newValue);
    }
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

export const [firstTabInNewTabGroup, setFirstTabInNewTabGroup] =
  adaptState<chrome.tabs.Tab | null>(null);

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

export const [currentSessionData, setCurrentSessionData] = adaptState<
  | Promise<chrome.bookmarks.BookmarkTreeNode | undefined | null>
  | chrome.bookmarks.BookmarkTreeNode
  | undefined
  | null
  | ""
>(async () => {
  // @handled
  try {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );

    return currentSessionData;
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

subscribeToStorageData(
  sessionStorageKeys.currentSessionData,
  ({ oldValue }) => {
    // @error
    if (oldValue === null || oldValue === "") {
      location.reload();
    }
  },
);

export const [sessionsTreeData, setSessionsTreeData] = adaptState<
  | chrome.bookmarks.BookmarkTreeNode[]
  | Promise<chrome.bookmarks.BookmarkTreeNode[]>
>(async () => {
  // @handled
  try {
    const rootBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.rootBookmarkNodeId);
    const pinnedTabGroupBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
    if (rootBookmarkNodeId && pinnedTabGroupBookmarkNodeId) {
      // not a typo. there's a difference between `sessionsData` and `sessionData`
      const sessionsData = (
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

      return sessionsData ?? [];
    } else {
      notifyWithErrorMessageAndReloadButton();

      return [];
    }
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();

    return [];
  }
});

async function updateSessionsTreeData() {
  // @error
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
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

chrome.bookmarks.onCreated.addListener(() => {
  // @handled
  try {
    updateSessionsTreeData();
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onChanged.addListener(() => {
  // @handled
  try {
    updateSessionsTreeData();
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onMoved.addListener(() => {
  // @handled
  try {
    updateSessionsTreeData();
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onRemoved.addListener(() => {
  // @handled
  try {
    updateSessionsTreeData();
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
    if (useCurrentSessionData) {
      await saveCurrentSessionDataIntoBookmarkNode(sessionData.id);
    }
    location.reload();
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
  location.reload();
}

export async function deleteSession(
  sessionId: chrome.bookmarks.BookmarkTreeNode["id"],
  isCurrentSession?: boolean,
) {
  // @maybe
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
  // @maybe
  sendMessage({ type: messageTypes.initSessionTabs, data: newSessionData });
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
    if (copy) {
      notify("Tab copied successfully.", "success");
    } else {
      await chrome.tabs.remove(_currentlyMovedOrCopiedTabOrTabGroup.id!);
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
    }
  }
  setCurrentMovedOrCopiedTabOrTabGroup(null);
  moveOrCopyTabGroupToSessionTreeDialogRef.value?.hide();
}

export async function moveTabOrTabGroupToWindow(
  windowId?: chrome.windows.Window["id"],
) {
  let stubTabId: chrome.tabs.Tab["id"] | undefined;
  console.log({ windowId });

  if (!windowId) {
    const window = await chrome.windows.create();
    stubTabId = (await chrome.tabs.query({ windowId: window?.id }))[0].id;
    windowId = window?.id;
  }
  const _currentlyEjectedTabOrTabGroup = currentlyEjectedTabOrTabGroup();
  if ((_currentlyEjectedTabOrTabGroup as chrome.tabs.Tab).url) {
    await chrome.tabs.move(_currentlyEjectedTabOrTabGroup?.id!, {
      windowId,
      index: -1,
    });
  } else if (
    (_currentlyEjectedTabOrTabGroup as TabGroupTreeData[number]).tabs
  ) {
    const tabIds = (
      _currentlyEjectedTabOrTabGroup as TabGroupTreeData[number]
    ).tabs.map((tab) => tab.id);
    await chrome.tabs.ungroup(tabIds as [number, ...number[]]);
    await chrome.tabs.move(tabIds as number[], {
      windowId,
      index: -1,
    });
    const newTabGroupId = await chrome.tabs.group({
      tabIds: tabIds as [number, ...number[]],
      createProperties: {
        windowId,
      },
    });
    const { color, title, collapsed } =
      _currentlyEjectedTabOrTabGroup as TabGroupTreeData[number];
    await chrome.tabGroups.update(newTabGroupId, { color, title, collapsed });
  }
  if (stubTabId) {
    await chrome.tabs.remove(stubTabId);
  }
  setCurrentlyEjectedTabOrTabGroup(null);
  sessionWindowsTreeDialogRef.value?.hide();
}
