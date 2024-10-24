import { adaptState } from "promethium-js";
import {
  bookmarkerDetails,
  localStorageKeys,
  messageTypes,
  protocolsEligibleForEncoding,
  sessionStorageKeys,
  stubPagePathName,
  titles,
  tabGroupTypes,
  tlds,
  newTabNavigatedTabId,
} from "../constants";
import { notify, notifyWithErrorMessageAndReloadButton } from "./utils";
import {
  type TabGroupTreeData,
  getStorageData,
  setStorageData,
  subscribeToStorageData,
  sendMessage,
  saveCurrentSessionDataIntoBookmarkNode,
  encodeTabDataAsUrl,
  openNavigationBox,
} from "../sharedUtils";
import {
  currentlyEjectedTabOrTabGroup,
  currentlyMovedOrCopiedTabOrTabGroup,
  deleteSessionDialogRef,
  moveOrCopyTabGroupToSessionTreeDialogRef,
  moveOrCopyTabToSessionTreeDialogRef,
  sessionWindowsTreeDialogRef,
  sessionsTreeDialogRef,
  setCurrentMovedOrCopiedTabOrTabGroup,
  setCurrentlyEjectedTabOrTabGroup,
} from "./App";
import { currentlyNavigatedTabId, navigateDialogRef } from "./NavigateDialog";

export const [tabGroupTreeData, setTabGroupTreeData] =
  adaptState<TabGroupTreeData>([]);

updateTabGroupTreeData();

async function updateTabGroupTreeData(tabGroupTreeData?: TabGroupTreeData) {
  // @error
  if (tabGroupTreeData === undefined) {
    tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData,
      )) ?? [];
  }
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
    await sendMessage({
      type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
    });
  } else if (tabGroup.type === tabGroupTypes.pinned) {
    await setStorageData(sessionStorageKeys.pinnedTabGroupCollapsed, false);
    await sendMessage({
      type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
    });
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
    await sendMessage({
      type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
    });
  } else if (tabGroup.type === tabGroupTypes.pinned) {
    await setStorageData(sessionStorageKeys.pinnedTabGroupCollapsed, true);
    await sendMessage({
      type: messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
    });
  } else if (tabGroup.type === tabGroupTypes.normal) {
    chrome.tabGroups.update(tabGroup.id, {
      collapsed: true,
    });
  }
}

export async function addTabToTabGroup(tabGroup: TabGroupTreeData[number]) {
  // @maybe
  const tab = await openNavigationBox({
    pinned: tabGroup.type === tabGroupTypes.pinned ? true : false,
  });
  if (tabGroup.type === tabGroupTypes.normal && tab?.id) {
    chrome.tabs.group({
      groupId: tabGroup.id,
      tabIds: tab.id,
    });
  }
}

export async function closeTabGroup(tabGroup: TabGroupTreeData[number]) {
  // @maybe
  const tabIds = tabGroup.tabs.map((tab) => tab.id) as [number, ...number[]];
  await chrome.tabs.remove(tabIds);
}

export async function activateTab(tab: chrome.tabs.Tab) {
  // @maybe
  // focus tab window first if it's not already in focus
  if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
    await chrome.windows.update(tab.windowId, { focused: true });
  }
  await chrome.tabs.update(tab.id as number, { active: true });
}

export async function createTabGroup(tab?: chrome.tabs.Tab) {
  // @maybe
  if (!tab) {
    tab = await openNavigationBox({ active: true });
  }
  if (tab) {
    const tabGroupId = await chrome.tabs.group({
      tabIds: tab.id as number,
      createProperties: {
        windowId: tab.windowId,
      },
    });
    await chrome.tabGroups.move(tabGroupId, { index: -1 });
  }
}

export async function updateTabGroup(
  tabId: chrome.tabGroups.TabGroup["id"] | null,
  options: {
    title: chrome.tabGroups.TabGroup["title"];
    color: chrome.tabGroups.Color;
  },
) {
  // @maybe
  if (tabId) {
    await chrome.tabGroups.update(tabId, {
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
  // @error
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

export const [sessionsTreeData, setSessionsTreeData] = adaptState<
  chrome.bookmarks.BookmarkTreeNode[]
>([]);

updateSessionsTreeData();

async function updateSessionsTreeData(
  bookmarkNodeIdOrBookmarkNodeInfo?:
    | chrome.bookmarks.BookmarkTreeNode["id"]
    | { parentId?: chrome.bookmarks.BookmarkTreeNode["id"] },
) {
  // @error
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(localStorageKeys.rootBookmarkNodeId);
  if (bookmarkNodeIdOrBookmarkNodeInfo) {
    if (typeof bookmarkNodeIdOrBookmarkNodeInfo === "string") {
      try {
        const bookmark = (
          await chrome.bookmarks.get(bookmarkNodeIdOrBookmarkNodeInfo)
        )[0];
        if (bookmark.parentId !== rootBookmarkNodeId) {
          return;
        }
      } catch (error) {
        return;
      }
    } else {
      if (bookmarkNodeIdOrBookmarkNodeInfo.parentId !== rootBookmarkNodeId) {
        return;
      }
    }
  }
  const pinnedTabGroupBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(localStorageKeys.pinnedTabGroupBookmarkNodeId);
  if (rootBookmarkNodeId && pinnedTabGroupBookmarkNodeId) {
    const sessionsDataChildren = (
      await chrome.bookmarks.getChildren(rootBookmarkNodeId)
    ).filter((sessionData) => {
      if (sessionData.url) {
        if (
          sessionData.url === bookmarkerDetails.url &&
          sessionData.title === bookmarkerDetails.title
        ) {
          return false;
        }
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

chrome.bookmarks.onCreated.addListener((_, bookmarkNode) => {
  // @handled
  try {
    updateSessionsTreeData(bookmarkNode);
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onChanged.addListener((bookmarkNodeId) => {
  // @handled
  try {
    updateSessionsTreeData(bookmarkNodeId);
  } catch (error) {
    console.error(error);
    notifyWithErrorMessageAndReloadButton();
  }
});

chrome.bookmarks.onMoved.addListener((bookmarkNodeId) => {
  // @handled
  try {
    updateSessionsTreeData(bookmarkNodeId);
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
  >(localStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    notify("Creating session...", "primary");
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
    notify("Session successfully created.", "success");
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
  notify("Deleting session...", "primary");
  await chrome.bookmarks.removeTree(sessionId);
  notify("Session deleted successfully...", "success");
  if (isCurrentSession) {
    await openNewSession(null);
  }
  await deleteSessionDialogRef.value?.hide();
}

export async function openNewSession(
  newSessionData: chrome.bookmarks.BookmarkTreeNode | null,
) {
  // @maybe
  await sessionsTreeDialogRef.value?.hide();
  await sendMessage({
    type: messageTypes.openNewSession,
    data: newSessionData,
  });
}

export async function moveOrCopyToSession(
  sessionOrTabGroupData: chrome.bookmarks.BookmarkTreeNode,
  copy: boolean = false,
) {
  // @maybe
  const _currentlyMovedOrCopiedTabOrTabGroup =
    currentlyMovedOrCopiedTabOrTabGroup();
  if (!_currentlyMovedOrCopiedTabOrTabGroup) {
    notifyWithErrorMessageAndReloadButton();
    return;
  }
  if ((_currentlyMovedOrCopiedTabOrTabGroup as chrome.tabs.Tab).url) {
    if (copy === true) {
      notify("Copying tab...", "primary");
    } else {
      notify("Moving tab...", "primary");
    }
    let ungroupedTabGroupDataParentId:
      | chrome.bookmarks.BookmarkTreeNode["id"]
      | undefined;
    if (sessionOrTabGroupData.title === titles.ungroupedTabGroup) {
      ungroupedTabGroupDataParentId = (
        await chrome.bookmarks.create({
          parentId: sessionOrTabGroupData.parentId,
          title: titles.ungroupedTabGroup,
        })
      ).id;
    }
    await chrome.bookmarks.create({
      parentId: ungroupedTabGroupDataParentId ?? sessionOrTabGroupData.id,
      url: (_currentlyMovedOrCopiedTabOrTabGroup as chrome.tabs.Tab).url,
      title: _currentlyMovedOrCopiedTabOrTabGroup.title,
    });
    if (copy === true) {
      notify("Tab copied successfully.", "success");
    } else {
      await chrome.tabs.remove(_currentlyMovedOrCopiedTabOrTabGroup.id!);
      notify("Tab moved successfully.", "success");
    }
    await moveOrCopyTabToSessionTreeDialogRef.value?.hide();
  } else if (
    (_currentlyMovedOrCopiedTabOrTabGroup as TabGroupTreeData[number]).tabs
  ) {
    if (copy === true) {
      notify("Copying tab group...", "primary");
    } else {
      notify("Moving tab group...", "primary");
    }
    let tabGroupData: chrome.bookmarks.BookmarkTreeNode | undefined;
    if (
      _currentlyMovedOrCopiedTabOrTabGroup.title === titles.ungroupedTabGroup
    ) {
      tabGroupData = await chrome.bookmarks.create({
        parentId: sessionOrTabGroupData.id,
        title: titles.ungroupedTabGroup,
      });
    } else {
      tabGroupData = await chrome.bookmarks.create({
        parentId: sessionOrTabGroupData.id,
        title: `${
          (_currentlyMovedOrCopiedTabOrTabGroup as TabGroupTreeData[number])
            .color
        }-${_currentlyMovedOrCopiedTabOrTabGroup.title}`,
      });
    }
    const tabs = await chrome.tabs.query({
      groupId: _currentlyMovedOrCopiedTabOrTabGroup.id,
      pinned: false,
    });
    const tabIds = tabs.map((tab) => tab.id);
    for (const tab of tabs) {
      let url: URL | undefined;
      if (tab.url) {
        url = new URL(tab.url);
      }
      if (
        url?.hostname === chrome.runtime.id &&
        url?.pathname === stubPagePathName
      ) {
        const params = new URLSearchParams(url.search);
        tab.url = params.get("url") ?? undefined;
      }
      await chrome.bookmarks.create({
        parentId: tabGroupData.id,
        url: tab.url,
        title: tab.title,
      });
    }
    if (copy === true) {
      notify("Tab group copied successfully.", "success");
    } else {
      await chrome.tabs.remove(tabIds as number[]);
      notify("Tab group moved successfully.", "success");
    }
    await moveOrCopyTabGroupToSessionTreeDialogRef.value?.hide();
  }
  setCurrentMovedOrCopiedTabOrTabGroup(null);
  updateSessionsTreeData();
}

export async function importTabGroupFromSession(
  tabGroupData: chrome.bookmarks.BookmarkTreeNode,
  copy: boolean = false,
) {
  // @maybe
  notify("Importing tab group...", "primary");
  const ungrouped = tabGroupData.title === titles.ungroupedTabGroup;
  let tabGroupDataChildren: Array<chrome.bookmarks.BookmarkTreeNode> = [];
  if (ungrouped) {
    tabGroupDataChildren =
      ((await chrome.bookmarks.getSubTree(tabGroupData.parentId!))[0].children
        ?.filter(
          (tabGroupData) => tabGroupData.title === titles.ungroupedTabGroup,
        )
        .map((tabGroupData) => tabGroupData.children)
        .flat()
        .filter(
          (tabData) => tabData !== undefined,
        ) as Array<chrome.bookmarks.BookmarkTreeNode>) ?? [];
  } else {
    tabGroupDataChildren = await chrome.bookmarks.getChildren(tabGroupData.id);
  }
  if (!tabGroupDataChildren.length) {
    notify("Tab group empty.", "warning");

    return;
  }
  const tabIds: Array<chrome.tabs.Tab["id"]> = [];
  for (const tabData of tabGroupDataChildren) {
    const url = encodeTabDataAsUrl({
      title: tabData.title,
      url: tabData.url || "",
    });
    const tab = await chrome.tabs.create({
      url,
      active: false,
    });
    tabIds.push(tab.id);
  }
  if (!ungrouped && tabIds.length) {
    const tabGroupTitle = tabGroupData.title.split("-").slice(1).join("-");
    const tabGroupColor = tabGroupData.title.split(
      "-",
    )[0] as chrome.tabGroups.Color;
    const tabGroupId = await chrome.tabs.group({
      tabIds: tabIds as [number, ...number[]],
    });
    await chrome.tabGroups.update(tabGroupId, {
      color: tabGroupColor,
      collapsed: true,
      title: tabGroupTitle,
    });
  }
  if (copy === false) {
    if (ungrouped) {
      const ungroupedTabGroupDataIds = (
        await chrome.bookmarks.getChildren(tabGroupData.parentId!)
      )
        .filter(
          (tabGroupData) => tabGroupData.title === titles.ungroupedTabGroup,
        )
        .map((tabGroupData) => tabGroupData.id);
      for (const ungroupedTabGroupDataId of ungroupedTabGroupDataIds) {
        await chrome.bookmarks.removeTree(ungroupedTabGroupDataId);
      }
    } else {
      await chrome.bookmarks.removeTree(tabGroupData.id);
    }
  }
  updateSessionsTreeData();
  notify("Tab group imported successfully.", "success");
}

export async function moveTabOrTabGroupToWindow(
  windowId?: chrome.windows.Window["id"],
) {
  // @maybe
  let stubTabId: chrome.tabs.Tab["id"] | undefined;
  if (!windowId) {
    const window = await chrome.windows.create({
      focused: false,
    });
    stubTabId = (await chrome.tabs.query({ windowId: window?.id }))[0].id;
    windowId = window?.id;
  }
  await chrome.sidePanel.open({ windowId });
  sendMessage({
    type: messageTypes.moveTabOrTabGroupToWindow,
    data: {
      currentlyEjectedTabOrTabGroup: currentlyEjectedTabOrTabGroup(),
      windowId,
      stubTabId,
    },
  });
  setCurrentlyEjectedTabOrTabGroup(null);
  await sessionWindowsTreeDialogRef.value?.hide();
}

export async function navigate(query: string) {
  // @maybe
  let url: string | undefined;
  try {
    url = new URL(query).href;
  } catch (error) {
    try {
      const possibleUrl = protocolsEligibleForEncoding[0] + query;
      const urlFromUrl = new URL(possibleUrl);
      url = tlds.some((tld) =>
        // convert both to lowercase just in case
        urlFromUrl.origin.toLowerCase().endsWith(`.${tld.toLowerCase()}`),
      )
        ? possibleUrl
        : undefined;
    } catch (error) {}
  }
  const navigationBoxTab = (
    await chrome.tabs.query({ active: true, currentWindow: true })
  )[0];
  let _currentlyNavigatedTabId = currentlyNavigatedTabId();
  if (_currentlyNavigatedTabId === newTabNavigatedTabId) {
    _currentlyNavigatedTabId = (
      await chrome.tabs.create({ active: false, url })
    ).id;
  }
  if (typeof _currentlyNavigatedTabId === "number") {
    if (url) {
      await chrome.tabs.update(_currentlyNavigatedTabId, { url });
    } else {
      await chrome.search.query({
        text: query,
        tabId: _currentlyNavigatedTabId,
      });
    }
    if (navigationBoxTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      await chrome.tabs.group({
        tabIds: _currentlyNavigatedTabId,
        groupId: navigationBoxTab.groupId,
      });
    }
    await chrome.tabs.update(_currentlyNavigatedTabId, {
      active: true,
      pinned: navigationBoxTab.pinned,
    });
  }
  await navigateDialogRef.value?.hide();
}

export const [sessionLoading, setSessionLoading] = adaptState<boolean>(false);
updateSessionLoading();

async function updateSessionLoading(sessionLoading?: boolean) {
  if (sessionLoading === undefined) {
    sessionLoading =
      (await getStorageData<boolean>(sessionStorageKeys.sessionLoading)) ??
      false;
  }
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
