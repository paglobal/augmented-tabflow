import {
  SessionData,
  commands,
  lockNames,
  recentUpdateListPage,
  messageTypes,
  sessionStorageKeys,
  stubPagePathName,
  tabGroupColorList,
  tabGroupTreeDataUpdateDebounceTimeout,
  tabGroupTypes,
  titles,
  localStorageKeys,
  AntecedentTabInfo,
  navigationBoxPathName,
  sessionStorageBackupInfoArray,
  helpPathName,
  updateAvailablePathName,
  LocalStorageKey,
  otherBookmarksBookmarkNodeTitle,
  bookmarkerDetails,
} from "./constants";
import {
  type TabGroupTreeData,
  getStorageData,
  setStorageData,
  subscribeToMessage,
  saveCurrentSessionDataIntoBookmarkNode,
  encodeTabDataAsUrl,
  insertBookmarker,
  openNavigationBox,
  withError,
  subscribeToStorageData,
  migrateAndDedupe,
} from "./sharedUtils";

for (const sessionStorageBackupInfo of sessionStorageBackupInfoArray) {
  subscribeToStorageData(sessionStorageBackupInfo.key, async ({ newValue }) => {
    await setStorageData(`local-${sessionStorageBackupInfo.key}`, newValue);
  });
}

async function restoreSessionStorageDataFromLocalStorage() {
  const sessionLoading = await getStorageData<boolean>(
    `local-${sessionStorageKeys.sessionLoading}`
  );
  for (const sessionStorageBackupInfo of sessionStorageBackupInfoArray) {
    const backedUpData = await getStorageData(
      `local-${sessionStorageBackupInfo.key}`
    );
    if (
      sessionLoading &&
      sessionStorageBackupInfo.restoreIfSessionLoading === false
    ) {
      continue;
    }
    await setStorageData(sessionStorageBackupInfo.key, backedUpData);
  }
}

async function createBookmarkNodeAndStoreId(
  localStorageKey: LocalStorageKey,
  bookmarkNodeTitle: string
) {
  try {
    // get `Other Bookmarks` folder id
    const bookmarkTree = await chrome.bookmarks.getTree();
    const otherBookmarksBookmarkNodeId = bookmarkTree[0].children?.find(
      (bookmark) => bookmark.title === otherBookmarksBookmarkNodeTitle
    )?.id;
    // get stored id of bookmark node and it's parent id if it's the pinned bookmarks folder
    const bookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(localStorageKey);
    let parentId: chrome.bookmarks.BookmarkTreeNode["id"] | undefined;
    if (localStorageKey === localStorageKeys.pinnedTabGroupBookmarkNodeId) {
      parentId = await getStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
        localStorageKeys.rootBookmarkNodeId
      );
    } else {
      parentId = otherBookmarksBookmarkNodeId;
    }
    // try to get bookmark node by id
    try {
      const bookmarkNode = (await chrome.bookmarks.get(bookmarkNodeId!))[0];
      // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case
      if (!bookmarkNode && parentId) {
        const bookmarkNodeId = (
          await chrome.bookmarks.create({
            title: bookmarkNodeTitle,
            parentId,
          })
        ).id;
        await setStorageData(localStorageKey, bookmarkNodeId);
      }
      // if unsuccessful, create new bookmark node and store id
    } catch (error) {
      const bookmarkNodeId = (
        await chrome.bookmarks.create({ title: bookmarkNodeTitle, parentId })
      ).id;
      await setStorageData(localStorageKey, bookmarkNodeId);
    }
    // insert bookmarker in bookmark node and dedupe bookmark node contents
    const _bookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(localStorageKey);
    if (_bookmarkNodeId && parentId) {
      await insertBookmarker(_bookmarkNodeId);
      const eligibleBookmarkNodes = (
        await Promise.all(
          (
            await chrome.bookmarks.getChildren(parentId)
          ).map(async (bookmarkNode) => {
            const bookmarkNodeChildren = await chrome.bookmarks.getChildren(
              bookmarkNode.id
            );

            return bookmarkNodeChildren.some(
              (bookmarkNode) =>
                bookmarkNode.title === bookmarkerDetails.title &&
                bookmarkNode.url === bookmarkerDetails.url
            )
              ? bookmarkNode
              : false;
          })
        )
      ).filter(Boolean);
      await migrateAndDedupe(
        eligibleBookmarkNodes as Array<chrome.bookmarks.BookmarkTreeNode>,
        _bookmarkNodeId
      );
      const bookmarkers: Array<chrome.bookmarks.BookmarkTreeNode> = (
        await chrome.bookmarks.getChildren(_bookmarkNodeId)
      ).filter(
        (bookmarkNode) =>
          bookmarkNode.title === bookmarkerDetails.title &&
          bookmarkNode.url === bookmarkerDetails.url
      );
      if (bookmarkers[0].id) {
        await migrateAndDedupe(bookmarkers, bookmarkers[0].id);
      }
    }
  } catch (error) {
    // no error handling here. we'll do that in the sidepanel ui
  }
}

async function initializeBookmarkNodes() {
  await navigator.locks.request(lockNames.initializeBookmarkNodes, async () => {
    await createBookmarkNodeAndStoreId(
      localStorageKeys.rootBookmarkNodeId,
      titles.rootBookmarkNode
    );
    await createBookmarkNodeAndStoreId(
      localStorageKeys.pinnedTabGroupBookmarkNodeId,
      titles.pinnedTabGroup
    );
  });
}

subscribeToMessage(messageTypes.initializeBookmarkNodes, async () => {
  // @error
  await initializeBookmarkNodes();
});

chrome.runtime.onUpdateAvailable.addListener(async (details) => {
  await chrome.tabs.create({
    url: updateAvailablePathName + `?version=${details.version}`,
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  // @error
  if (details.reason === "install") {
    await chrome.tabs.create({
      url: helpPathName,
    });
  } else if (details.reason === "update") {
    await restoreSessionStorageDataFromLocalStorage();
    await chrome.tabs.create({
      url: recentUpdateListPage,
    });
  }
  await initializeBookmarkNodes();
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.runtime.onStartup.addListener(async () => {
  // @error
  const openPanelOnActionClick = await getStorageData<boolean>(
    localStorageKeys.openPanelOnActionClick
  );
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: openPanelOnActionClick ?? true,
  });
  await initializeBookmarkNodes();
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onCreated.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onRemoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabGroups.onUpdated.addListener(async (tabGroup) => {
  // @error
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData
    )) ?? [];
  const oldTabGroup = tabGroupTreeData.find(
    (_tabGroup) => _tabGroup.id === tabGroup.id
  );
  if (
    oldTabGroup?.title !== tabGroup.title ||
    oldTabGroup?.color !== tabGroup.color
  ) {
    await setStorageData(
      sessionStorageKeys.readyToUpdateCurrentSessionData,
      true
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
  const [error, antecedentTabInfo] = await withError(
    getStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo)
  );
  if (error) {
    // @handle
  } else {
    if (antecedentTabInfo?.id && antecedentTabInfo.id !== activeInfo.tabId) {
      const [error] = await withError(
        setStorageData<AntecedentTabInfo>(
          sessionStorageKeys.antecedentTabInfo,
          null
        )
      );
      if (error) {
        // @handle
      }
    }
  }
});

chrome.tabs.onAttached.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onCreated.addListener(async (tab) => {
  // @error
  await navigator.locks.request(lockNames.removingOldSessionTabs, async () => {
    // @error
    const removingOldSessionTabs = await getStorageData<boolean>(
      sessionStorageKeys.removingOldSessionTabs
    );
    if (removingOldSessionTabs) {
      const tabWindowType = (await chrome.windows.get(tab.windowId)).type;
      const stubTabId = await getStorageData<chrome.tabs.Tab["id"] | null>(
        sessionStorageKeys.stubTabId
      );
      if (tabWindowType === "normal" && tab.id !== stubTabId) {
        await chrome.tabs.remove(tab.id!);
      }
    }
  });
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onDetached.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
  );
  await updateTabGroupTreeDataAndCurrentSessionData();
  const [error, antecedentTabInfo] = await withError(
    getStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo)
  );
  if (error) {
    // @handle
  } else {
    if (antecedentTabInfo?.id === tabId && antecedentTabInfo?.precedentTabId) {
      const [error] = await withError(
        chrome.tabs.update(antecedentTabInfo.precedentTabId, {
          active: true,
        })
      );
      if (error) {
        // @handle
      }
      const [_error] = await withError(
        setStorageData<AntecedentTabInfo>(
          sessionStorageKeys.antecedentTabInfo,
          null
        )
      );
      if (_error) {
        // @handle
      }
    }
  }
});

chrome.tabs.onReplaced.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true
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
      true
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
  const fullscreen = await getStorageData<boolean>(
    sessionStorageKeys.fullscreen
  );
  if (window.type === "normal" && window.id) {
    await chrome.windows.update(window.id, {
      state: fullscreen ? "fullscreen" : "maximized",
      focused: true,
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
      await setStorageData<boolean>(sessionStorageKeys.fullscreen, true);
    } else {
      await setStorageData<boolean>(sessionStorageKeys.fullscreen, false);
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
          sessionStorageKeys.stubTabId
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
          }
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
  sessionData: chrome.bookmarks.BookmarkTreeNode
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
      "-"
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
      sessionStorageKeys.previousUnsavedSessionTabGroupTreeData
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
      sessionStorageKeys.currentSessionData
    );
    const tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData
      )) ?? [];
    if (!oldSessionData) {
      await setStorageData<TabGroupTreeData>(
        sessionStorageKeys.previousUnsavedSessionTabGroupTreeData,
        tabGroupTreeData
      );
    }
    await setStorageData(sessionStorageKeys.currentSessionData, newSessionData);
    await setStorageData(sessionStorageKeys.sessionLoading, true);
    await setStorageData(sessionStorageKeys.recentlyClosedTabGroups, []);
    await setStorageData(sessionStorageKeys.currentTabGroupSpaceIndex, 0);
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
      sessionStorageKeys.stubTabId
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
  stubTabId?: chrome.tabs.Tab["id"]
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
    data.stubTabId
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
  const tabs = (
    await chrome.tabs.query({
      windowType: "normal",
    })
  ).filter(
    (tab) => !tab.url?.startsWith(chrome.runtime.getURL(navigationBoxPathName))
  );
  for (const tab of tabs) {
    if (tab.status === "loading") {
      await updateTabGroupTreeDataAndCurrentSessionData(5000);

      break;
    }
  }
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
        (tabGroup) => tabGroup.id === currentTab.groupId
      );
      if (currentTabGroupIndex !== -1) {
        tabGroupTreeData[currentTabGroupIndex].tabs.push(currentTab);
      } else {
        const currentTabGroup = tabGroups.find(
          (tabGroup) => tabGroup.id === currentTab.groupId
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
    []
  );
  const ungroupedTabs = (
    await chrome.tabs.query({
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      windowType: "normal",
      pinned: false,
    })
  ).filter(
    (tab) => !tab.url?.startsWith(chrome.runtime.getURL(navigationBoxPathName))
  );
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
    localStorageKeys.ungroupedTabGroupCollapsed
  );
  if (ungroupedTabs.length) {
    tabGroupTreeData.unshift({
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
  const pinnedTabs = (
    await chrome.tabs.query({
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      windowType: "normal",
      pinned: true,
    })
  ).filter(
    (tab) => !tab.url?.startsWith(chrome.runtime.getURL(navigationBoxPathName))
  );
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
    localStorageKeys.pinnedTabGroupCollapsed
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
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"]
) {
  // @maybe
  const currentSessionDataChildren = await chrome.bookmarks.getChildren(
    bookmarkNodeId
  );
  for (const tabGroupData of currentSessionDataChildren) {
    try {
      await chrome.bookmarks.removeTree(tabGroupData.id);
    } catch (error) {}
  }
}

async function updateCurrentSessionData() {
  // @maybe
  const readyToUpdateCurrentSessionData = await getStorageData<boolean>(
    sessionStorageKeys.readyToUpdateCurrentSessionData
  );
  const currentSessionData =
    await getStorageData<chrome.bookmarks.BookmarkTreeNode>(
      sessionStorageKeys.currentSessionData
    );
  if (!readyToUpdateCurrentSessionData) {
    return;
  }
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData
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
    false
  );
}

async function removeSessionFolderFromDefaultBookmarkSuggestion() {
  const bookmarkNodeId = (await chrome.bookmarks.create({})).id;
  await chrome.bookmarks.remove(bookmarkNodeId);
}

async function applyUpdates() {
  // @maybe
  navigator.locks.request(lockNames.applyUpdates, async () => {
    const tabGroupTreeData = await getTabGroupTreeData();
    await setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
    await updateCurrentSessionData();
    await removeSessionFolderFromDefaultBookmarkSuggestion();
    const sessionLoading = await getStorageData<boolean>(
      sessionStorageKeys.sessionLoading
    );
    if (sessionLoading) {
      await setStorageData(sessionStorageKeys.sessionLoading, false);
    }
  });
}

async function updateTabGroupTreeDataAndCurrentSessionData(timeout?: number) {
  // @maybe
  const debounceTabGroupTreeDataUpdates = await getStorageData<boolean>(
    sessionStorageKeys.debounceTabGroupTreeDataUpdates
  );
  const tabGroupTreeDataUpdateTimeoutId = await getStorageData<number>(
    sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId
  );
  if (!debounceTabGroupTreeDataUpdates) {
    applyUpdates();
    await setStorageData(
      sessionStorageKeys.debounceTabGroupTreeDataUpdates,
      true
    );
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    setStorageData(
      sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId,
      setTimeout(() => {
        setStorageData(
          sessionStorageKeys.debounceTabGroupTreeDataUpdates,
          false
        );
      }, timeout ?? tabGroupTreeDataUpdateDebounceTimeout)
    );
  } else {
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    setStorageData(
      sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId,
      setTimeout(() => {
        setStorageData(
          sessionStorageKeys.debounceTabGroupTreeDataUpdates,
          false
        );
        applyUpdates();
      }, timeout ?? tabGroupTreeDataUpdateDebounceTimeout)
    );
  }
}

subscribeToMessage(
  messageTypes.updateTabGroupTreeDataAndCurrentSessionData,
  async () => {
    // @maybe
    await updateTabGroupTreeDataAndCurrentSessionData();
  }
);

async function createTabGroup() {
  // @maybe
  const [error, currentTab] = await withError(chrome.tabs.getCurrent());
  if (error) {
    //@handle
  }
  const tab = await openNavigationBox({
    active: false,
    precedentTabId: currentTab?.id,
    group: true,
  });
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { active: true });
  }
}

chrome.commands.onCommand.addListener(async (command, tab) => {
  // @maybe
  if (command === commands.toggleAction) {
    const panelBehaviour = await chrome.sidePanel.getPanelBehavior();
    const openPanelOnActionClick = !panelBehaviour.openPanelOnActionClick;
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick,
    });
    await setStorageData<boolean>(
      localStorageKeys.openPanelOnActionClick,
      openPanelOnActionClick
    );
  } else if (command === commands.closeAllSessionWindows) {
    await closeAllSessionWindows();
  } else if (command === commands.exitCurrentSession) {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData
      );
    if (currentSessionData) {
      await openNewSession(null);
    }
  } else if (command === commands.editCurrentTabURL) {
    if (tab?.id) {
      await openNavigationBox({
        navigatedTabId: tab.id,
        precedentTabId: tab.id,
      });
    }
  } else if (command === commands.openNewTab) {
    await openNavigationBox({ precedentTabId: tab?.id });
  } else if (command === commands.openNewWindow) {
    await openNavigationBox({ newWindow: true, precedentTabId: tab?.id });
  } else if (command === commands.openNewTabGroup) {
    await createTabGroup();
  }
});
