import {
  SessionData,
  lockNames,
  messageTypes,
  sessionStorageKeys,
  stubPagePathName,
  syncStorageKeys,
  tabGroupColorList,
  tabGroupTreeDataUpdateDebounceTimeout,
  tabGroupTypes,
  titles,
} from "./constants";
import {
  type TabGroupTreeData,
  createBookmarkNodeAndSyncId,
  getStorageData,
  setStorageData,
  subscribeToMessage,
  saveCurrentSessionDataIntoBookmarkNode,
  encodeTabDataAsUrl,
} from "./sharedUtils";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async (details) => {
  // @error
  if (details.reason === "install") {
    await chrome.tabs.create({
      url: "https://www.paglobal.tech/pages/projects/augmented-tabflow.html",
    });
  } else if (details.reason === "update") {
    await chrome.tabs.create({
      url: "https://www.paglobal.tech/pages/posts/augmented-tabflow-changelog.html",
    });
  }
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.pinnedTabGroupBookmarkNodeId,
    titles.pinnedTabGroup,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.runtime.onStartup.addListener(async () => {
  // @error
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndSyncId(
    syncStorageKeys.pinnedTabGroupBookmarkNodeId,
    titles.pinnedTabGroup,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onCreated.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onRemoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onUpdated.addListener(async (tabGroup) => {
  // @error
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    )) ?? [];
  const oldTabGroup = tabGroupTreeData.find(
    (_tabGroup) => _tabGroup.id === tabGroup.id,
  );
  if (
    oldTabGroup?.title !== tabGroup.title ||
    oldTabGroup?.color !== tabGroup.color
  ) {
    await setStorageData(
      sessionStorageKeys.readyToUpdateCurrentSessionData,
      true,
    );
  }
  await updateTabGroupTreeDataAndCurrentSessionData();
});

async function restoreTabIfBlank(tabId: chrome.tabs.Tab["id"]) {
  try {
    if (tabId) {
      const tab = await chrome.tabs.get(tabId);
      let url: URL | undefined;
      if (tab.url) {
        url = new URL(tab.url);
      }
      if (
        url?.hostname === chrome.runtime.id &&
        url?.pathname === stubPagePathName
      ) {
        const params = new URLSearchParams(url.search);
        await chrome.tabs.update(tabId, {
          url: params.get("url") ?? undefined,
        });
      }
    }
  } catch (error) {
    // just discard error. if tab can't be found, there's not reason to restore it
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // @error
  await restoreTabIfBlank(activeInfo.tabId);
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onAttached.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onCreated.addListener(async (tab) => {
  // @error
  await navigator.locks.request(lockNames.removingOldSessionTabs, async () => {
    // @error
    const removingOldSessionTabs = await getStorageData<boolean>(
      sessionStorageKeys.removingOldSessionTabs,
    );
    if (removingOldSessionTabs) {
      const tabWindowType = (await chrome.windows.get(tab.windowId)).type;
      const stubTabId = await getStorageData<chrome.tabs.Tab["id"] | null>(
        sessionStorageKeys.stubTabId,
      );
      if (tabWindowType === "normal" && tab.id !== stubTabId) {
        await chrome.tabs.remove(tab.id!);
      }
    }
  });
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onDetached.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onRemoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onReplaced.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo) => {
  // @error
  if (
    changeInfo.title ||
    changeInfo.url ||
    changeInfo.groupId ||
    changeInfo.pinned
  ) {
    await setStorageData(
      sessionStorageKeys.readyToUpdateCurrentSessionData,
      true,
    );
  }
  await updateTabGroupTreeDataAndCurrentSessionData();
});

async function removeOldSessionTabs(tabGroupTreeData: TabGroupTreeData) {
  await navigator.locks.request(lockNames.removingOldSessionTabs, async () => {
    await setStorageData(sessionStorageKeys.removingOldSessionTabs, true);
  });
  const initialStubTabId = (await chrome.tabs.create({ active: false })).id;
  await setStorageData(sessionStorageKeys.stubTabId, initialStubTabId);
  for (const tabGroup of tabGroupTreeData) {
    if (tabGroup.type === tabGroupTypes.pinned) {
      continue;
    }
    for (const tab of tabGroup.tabs) {
      try {
        const stubTabId = await getStorageData<chrome.tabs.Tab["id"] | null>(
          sessionStorageKeys.stubTabId,
        );
        // this has to error if stub tab doesn't exist
        await chrome.tabs.get(stubTabId!);
      } catch (error) {
        await navigator.locks.request(
          lockNames.removingOldSessionTabs,
          async () => {
            const newStubTabId = (await chrome.tabs.create({ active: false }))
              .id;
            await setStorageData(sessionStorageKeys.stubTabId, newStubTabId);
          },
        );
      }
      try {
        await setStorageData(sessionStorageKeys.currentlyRemovedTabId, tab.id);
        await chrome.tabs.remove(tab.id!);
      } catch (error) {
        console.error(error);
      }
    }
  }
  await setStorageData(sessionStorageKeys.currentlyRemovedTabId, null);
  await navigator.locks.request(lockNames.removingOldSessionTabs, async () => {
    await setStorageData(sessionStorageKeys.removingOldSessionTabs, false);
  });
}

async function createSessionTabsFromSessionData(
  sessionData: chrome.bookmarks.BookmarkTreeNode,
) {
  const sessionDataChildren =
    (await chrome.bookmarks.getSubTree(sessionData.id))[0].children ?? [];
  if (!sessionDataChildren?.length) {
    await chrome.tabs.create({ active: false });
  }
  for (let i = 0; i < sessionDataChildren.length; i++) {
    const tabGroupData = sessionDataChildren[i];
    const tabGroupColor = tabGroupData.title.split(
      "-",
    )[0] as chrome.tabGroups.Color;
    const ungrouped = tabGroupData.title === titles.ungroupedTabGroup;
    if (tabGroupData.url) {
      continue;
    }
    if (!tabGroupColorList.includes(tabGroupColor) && !ungrouped) {
      continue;
    }
    const tabIds: chrome.tabs.Tab["id"][] = [];
    const tabGroupDataChildren = tabGroupData.children ?? [];
    for (let j = 0; j < tabGroupDataChildren.length; j++) {
      const tabData = tabGroupDataChildren[j];
      const active = i === 0 && j === 0 ? true : false;
      const url = encodeTabDataAsUrl({
        title: tabData.title,
        url: tabData.url || "",
        active,
      });
      const tab = await chrome.tabs.create({
        url,
        active,
      });
      tabIds.push(tab.id);
    }
    if (!ungrouped && tabIds.length) {
      const tabGroupTitle = tabGroupData.title.split("-").slice(1).join("-");
      const tabGroupId = await chrome.tabs.group({
        tabIds: tabIds as [number, ...number[]],
      });
      await chrome.tabGroups.update(tabGroupId, {
        color: tabGroupColor,
        collapsed: i === 0 ? false : true,
        title: tabGroupTitle,
      });
    }
  }
}

async function createSessionTabsFromPreviousUnsavedSessionTabGroupTreeData() {
  const previousUnsavedSessionTabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
    )) ?? [];
  if (!previousUnsavedSessionTabGroupTreeData?.length) {
    await chrome.tabs.create({ active: false });
  }
  for (let i = 0; i < previousUnsavedSessionTabGroupTreeData.length; i++) {
    const tabGroup = previousUnsavedSessionTabGroupTreeData[i];
    const pinned = tabGroup.type === tabGroupTypes.pinned;
    if (pinned) {
      continue;
    }
    const ungrouped = tabGroup.id === chrome.tabGroups.TAB_GROUP_ID_NONE;
    const tabIds: chrome.tabs.Tab["id"][] = [];
    const tabs = tabGroup.tabs;
    for (let j = 0; j < tabs.length; j++) {
      const oldTab = tabs[j];
      const active =
        (previousUnsavedSessionTabGroupTreeData.length === 1 && j === 0) ||
        (i === 0 && j === 0 && tabGroup.type !== tabGroupTypes.pinned) ||
        (i === 1 &&
          j === 0 &&
          previousUnsavedSessionTabGroupTreeData[0].type ===
            tabGroupTypes.pinned)
          ? true
          : false;
      const url = encodeTabDataAsUrl({
        title: oldTab.title || "",
        url: oldTab.url || "",
        active,
      });
      const tab = await chrome.tabs.create({
        url,
        active,
        pinned,
      });
      tabIds.push(tab.id);
    }
    if (!ungrouped && tabIds.length) {
      const { title, color } = tabGroup;
      const tabGroupId = await chrome.tabs.group({
        tabIds: tabIds as [number, ...number[]],
      });
      await chrome.tabGroups.update(tabGroupId, {
        color,
        collapsed: i === 0 ? false : true,
        title,
      });
    }
  }
}

async function openNewSession(newSessionData?: SessionData) {
  // @maybe
  await navigator.locks.request(lockNames.applyUpdates, async () => {
    const oldSessionData = await getStorageData<SessionData>(
      sessionStorageKeys.currentSessionData,
    );
    const tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData,
      )) ?? [];
    if (!oldSessionData) {
      await setStorageData<TabGroupTreeData>(
        sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
        tabGroupTreeData,
      );
    }
    await setStorageData(sessionStorageKeys.currentSessionData, newSessionData);
    await setStorageData(sessionStorageKeys.sessionLoading, true);
    await setStorageData(sessionStorageKeys.recentlyClosedTabGroups, []);
    await removeOldSessionTabs(tabGroupTreeData);
    if (newSessionData) {
      await createSessionTabsFromSessionData(newSessionData);
    } else {
      await createSessionTabsFromPreviousUnsavedSessionTabGroupTreeData();
    }
    const sessionTabs = await chrome.tabs.query({
      windowType: "normal",
    });
    const stubTabId = await getStorageData<chrome.tabs.Tab["id"] | null>(
      sessionStorageKeys.stubTabId,
    );
    if (sessionTabs.length > 1 && stubTabId) {
      await setStorageData(sessionStorageKeys.currentlyRemovedTabId, stubTabId);
      await chrome.tabs.remove(stubTabId);
      await setStorageData(sessionStorageKeys.currentlyRemovedTabId, null);
    }
    await setStorageData(sessionStorageKeys.stubTabId, null);
  });
}

subscribeToMessage(messageTypes.openNewSession, async (newSessionData) => {
  // @error
  await openNewSession(newSessionData);
});

subscribeToMessage(messageTypes.restoreTab, async (_, sender) => {
  // @error
  await restoreTabIfBlank(sender.tab?.id);
});

export async function moveTabOrTabGroupToWindow(
  currentlyEjectedTabOrTabGroup:
    | chrome.tabs.Tab
    | chrome.tabGroups.TabGroup
    | null,
  windowId?: chrome.windows.Window["id"],
) {
  let stubTabId: chrome.tabs.Tab["id"] | undefined;
  if (!windowId) {
    const window = await chrome.windows.create();
    stubTabId = (await chrome.tabs.query({ windowId: window?.id }))[0].id;
    windowId = window?.id;
  }
  if ((currentlyEjectedTabOrTabGroup as chrome.tabs.Tab).url) {
    await chrome.tabs.move(currentlyEjectedTabOrTabGroup?.id!, {
      windowId,
      index: -1,
    });
    await chrome.tabs.update(currentlyEjectedTabOrTabGroup?.id!, {
      pinned: (currentlyEjectedTabOrTabGroup as chrome.tabs.Tab).pinned,
    });
  } else if ((currentlyEjectedTabOrTabGroup as TabGroupTreeData[number]).tabs) {
    const tabIds = (
      currentlyEjectedTabOrTabGroup as TabGroupTreeData[number]
    ).tabs.map((tab) => tab.id);
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
      currentlyEjectedTabOrTabGroup as TabGroupTreeData[number];
    await chrome.tabGroups.update(newTabGroupId, { color, title, collapsed });
  }
  if (stubTabId) {
    await chrome.tabs.remove(stubTabId);
  }
}

subscribeToMessage(messageTypes.moveTabOrTabGroupToWindow, (data) => {
  moveTabOrTabGroupToWindow(data.currentlyEjectedTabOrTabGroup, data.windowId);
});

async function closeAllSessionWindows() {
  await navigator.locks.request(lockNames.applyUpdates, async () => {
    await setStorageData(sessionStorageKeys.sessionLoading, true);
    const sessionTabs = await chrome.tabs.query({ windowType: "normal" });
    for (const tab of sessionTabs) {
      try {
        await setStorageData(sessionStorageKeys.currentlyRemovedTabId, tab.id);
        await chrome.tabs.remove(tab.id!);
      } catch (error) {
        console.error(error);
      }
    }
    await setStorageData(sessionStorageKeys.currentlyRemovedTabId, null);
  });
}

subscribeToMessage(messageTypes.closeAllSessionWindows, async () => {
  // @error
  await closeAllSessionWindows();
});

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
        url?.pathname === stubPagePathName
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
      url?.pathname === stubPagePathName
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
      url?.pathname === stubPagePathName
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
  if (!readyToUpdateCurrentSessionData) {
    return;
  }
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    )) ?? [];
  if (tabGroupTreeData.length) {
    if (currentSessionData) {
      await removeBookmarkNodeChildren(currentSessionData.id);
      await saveCurrentSessionDataIntoBookmarkNode(currentSessionData.id);
    }
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
  } else {
    await setStorageData(sessionStorageKeys.currentSessionData, null);
  }
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    false,
  );
}

async function reinitializePinnedTabs() {
  await setStorageData(sessionStorageKeys.sessionLoading, true);
  const oldPinnedTabs = await chrome.tabs.query({ pinned: true });
  for (const tab of oldPinnedTabs) {
    try {
      await setStorageData(sessionStorageKeys.currentlyRemovedTabId, tab.id);
      await chrome.tabs.remove(tab.id!);
    } catch (error) {
      console.error(error);
    }
  }
  const pinnedTabGroupBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
  if (pinnedTabGroupBookmarkNodeId) {
    const pinnedTabGroupBookmarkNodeChildren =
      await chrome.bookmarks.getChildren(pinnedTabGroupBookmarkNodeId);
    for (const tabData of pinnedTabGroupBookmarkNodeChildren.reverse()) {
      const url = encodeTabDataAsUrl({
        title: tabData.title,
        url: tabData.url || "",
      });
      await chrome.tabs.create({
        url,
        pinned: true,
        active: false,
      });
    }
  } else {
    // @error
  }
  await setStorageData(sessionStorageKeys.sessionLoading, false);
}

async function applyUpdates() {
  navigator.locks.request(lockNames.applyUpdates, async () => {
    const startup = await getStorageData<boolean>(sessionStorageKeys.startup);
    if (startup === undefined) {
      await reinitializePinnedTabs();
      await setStorageData(sessionStorageKeys.startup, false);
    }
    const tabGroupTreeData = await getTabGroupTreeData();
    await setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
    await updateCurrentSessionData();
    const sessionLoading = await getStorageData<boolean>(
      sessionStorageKeys.sessionLoading,
    );
    if (sessionLoading) {
      await setStorageData(sessionStorageKeys.sessionLoading, false);
    }
  });
}

async function updateTabGroupTreeDataAndCurrentSessionData() {
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

subscribeToMessage(
  messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
  async () => {
    await updateTabGroupTreeDataAndCurrentSessionData();
  },
);

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "close-all-session-windows") {
    closeAllSessionWindows();
  } else if (command === "exit-current-session") {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );
    if (currentSessionData) {
      openNewSession(null);
    }
  }
});
