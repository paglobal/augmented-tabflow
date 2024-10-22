import {
  SessionData,
  commands,
  lockNames,
  onInstalledPage,
  onUpdatedPage,
  messageTypes,
  sessionStorageKeys,
  stubPagePathName,
  tabGroupColorList,
  tabGroupTreeDataUpdateDebounceTimeout,
  tabGroupTypes,
  titles,
  localStorageKeys,
  bookmarkerDetails,
  CurrentlyNavigatedTabId,
  navigationBoxPathName,
  newTabNavigatedTabId,
} from "./constants";
import {
  type TabGroupTreeData,
  createBookmarkNodeAndStoreId,
  getStorageData,
  setStorageData,
  subscribeToMessage,
  saveCurrentSessionDataIntoBookmarkNode,
  encodeTabDataAsUrl,
  insertBookmarker,
} from "./sharedUtils";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async (details) => {
  // @error
  if (details.reason === "install") {
    await chrome.tabs.create({
      url: onInstalledPage,
    });
  } else if (details.reason === "update") {
    await chrome.tabs.create({
      url: onUpdatedPage,
    });
  }
  await createBookmarkNodeAndStoreId(
    localStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndStoreId(
    localStorageKeys.pinnedTabGroupBookmarkNodeId,
    titles.pinnedTabGroup,
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.runtime.onStartup.addListener(async () => {
  // @error
  await createBookmarkNodeAndStoreId(
    localStorageKeys.rootBookmarkNodeId,
    titles.rootBookmarkNode,
  );
  await createBookmarkNodeAndStoreId(
    localStorageKeys.pinnedTabGroupBookmarkNodeId,
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

chrome.windows.onBoundsChanged.addListener(async (window) => {
  // @maybe
  await syncWindowFullscreenState(window);
});

chrome.windows.onCreated.addListener(async (window) => {
  // @maybe
  const fullscreen = await getStorageData<boolean>(localStorageKeys.fullscreen);
  if (window.type === "normal" && window.id) {
    await chrome.windows.update(window.id, {
      state: fullscreen ? "fullscreen" : "maximized",
    });
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  // @maybe
  if (windowId !== -1) {
    const window = await chrome.windows.get(windowId);
    await syncWindowFullscreenState(window);
  }
});

async function syncWindowFullscreenState(window: chrome.windows.Window) {
  // @maybe
  if (window.type === "normal") {
    if (window.state === "fullscreen") {
      await setStorageData<boolean>(localStorageKeys.fullscreen, true);
    } else {
      await setStorageData<boolean>(localStorageKeys.fullscreen, false);
    }
  }
}

async function removeOldSessionTabs(tabGroupTreeData: TabGroupTreeData) {
  // @maybe
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
  // @maybe
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
  // @maybe
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
  windowId: chrome.windows.Window["id"],
  stubTabId?: chrome.tabs.Tab["id"],
) {
  // @maybe
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
  // @maybe
  moveTabOrTabGroupToWindow(
    data.currentlyEjectedTabOrTabGroup,
    data.windowId,
    data.stubTabId,
  );
});

async function closeAllSessionWindows() {
  // @maybe
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
  // @maybe
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
  // @maybe
  const currentSessionDataChildren =
    await chrome.bookmarks.getChildren(bookmarkNodeId);
  for (const tabGroupData of currentSessionDataChildren) {
    try {
      await chrome.bookmarks.removeTree(tabGroupData.id);
    } catch (error) {}
  }
}

async function updateCurrentSessionData() {
  // @maybe
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
    >(localStorageKeys.pinnedTabGroupBookmarkNodeId);
    if (pinnedTabGroupBookmarkNodeId) {
      await removeBookmarkNodeChildren(pinnedTabGroupBookmarkNodeId);
      await insertBookmarker(pinnedTabGroupBookmarkNodeId);
      if (tabGroupTreeData[0]?.type === tabGroupTypes.pinned) {
        for (const tab of tabGroupTreeData[0].tabs) {
          await chrome.bookmarks.create({
            parentId: pinnedTabGroupBookmarkNodeId,
            title: tab.title,
            url: tab.url,
          });
        }
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
  // @maybe
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
  >(localStorageKeys.pinnedTabGroupBookmarkNodeId);
  if (pinnedTabGroupBookmarkNodeId) {
    const pinnedTabGroupBookmarkNodeChildren =
      await chrome.bookmarks.getChildren(pinnedTabGroupBookmarkNodeId);
    for (const tabData of pinnedTabGroupBookmarkNodeChildren) {
      if (
        tabData.title === bookmarkerDetails.title &&
        tabData.url === bookmarkerDetails.url
      ) {
        continue;
      }
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

async function removeSessionFolderFromDefaultBookmarkSuggestion() {
  const bookmarkNodeId = (await chrome.bookmarks.create({})).id;
  await chrome.bookmarks.remove(bookmarkNodeId);
}

async function applyUpdates() {
  // @maybe
  navigator.locks.request(lockNames.applyUpdates, async () => {
    const startup = await getStorageData<boolean>(sessionStorageKeys.startup);
    if (startup === undefined) {
      await reinitializePinnedTabs();
      const fullscreen = await getStorageData<boolean>(
        localStorageKeys.fullscreen,
      );
      const sessionWindows = await chrome.windows.getAll({
        windowTypes: ["normal"],
      });
      sessionWindows.forEach(async (sessionWindow) => {
        if (sessionWindow.id) {
          const newState = fullscreen ? "fullscreen" : sessionWindow.state;
          await chrome.windows.update(sessionWindow.id, { state: newState });
        }
      });
      await setStorageData(sessionStorageKeys.startup, false);
    }
    const tabGroupTreeData = await getTabGroupTreeData();
    await setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
    await updateCurrentSessionData();
    await removeSessionFolderFromDefaultBookmarkSuggestion();
    const sessionLoading = await getStorageData<boolean>(
      sessionStorageKeys.sessionLoading,
    );
    if (sessionLoading) {
      await setStorageData(sessionStorageKeys.sessionLoading, false);
    }
  });
}

async function updateTabGroupTreeDataAndCurrentSessionData() {
  // @maybe
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
    // @maybe
    await updateTabGroupTreeDataAndCurrentSessionData();
  },
);

chrome.commands.onCommand.addListener(async (command, tab) => {
  // @maybe
  if (command === commands.openSidePanel) {
    await chrome.sidePanel.open({});
  } else if (command === commands.closeAllSessionWindows) {
    await closeAllSessionWindows();
  } else if (command === commands.exitCurrentSession) {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );
    if (currentSessionData) {
      await openNewSession(null);
    }
  } else if (command === commands.editCurrentTabURL) {
    if (tab?.id) {
      await setStorageData<CurrentlyNavigatedTabId>(
        sessionStorageKeys.currentlyNavigatedTabId,
        tab.id,
      );
      await chrome.tabs.create({ url: navigationBoxPathName });
    }
  } else if (command === commands.openNewTab) {
    await setStorageData<CurrentlyNavigatedTabId>(
      sessionStorageKeys.currentlyNavigatedTabId,
      newTabNavigatedTabId,
    );
    await chrome.tabs.create({ url: navigationBoxPathName });
  } else if (command === commands.openNewWindow) {
    await setStorageData<CurrentlyNavigatedTabId>(
      sessionStorageKeys.currentlyNavigatedTabId,
      newTabNavigatedTabId,
    );
    await chrome.windows.create({
      url: navigationBoxPathName,
      focused: true,
      type: "normal",
    });
  }
});
