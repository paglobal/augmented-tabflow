import {
  SessionData,
  lockNames,
  messageTypes,
  sessionStorageKeys,
  syncStorageKeys,
  tabGroupColorList,
  tabGroupTypes,
  titles,
} from "./constants";
import {
  type TabGroupTreeData,
  createBookmarkNodeAndSyncId,
  getStorageData,
  setStorageData,
  subscribeToMessage,
  updateTabGroupTreeDataAndCurrentSessionData,
} from "./sharedUtils";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async () => {
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

chrome.tabGroups.onUpdated.addListener(async () => {
  // @error
  await setStorageData(
    sessionStorageKeys.readyToUpdateCurrentSessionData,
    true,
  );
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
        url?.pathname === "/stubPage.html"
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

chrome.tabs.onCreated.addListener(async () => {
  // @error
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
  if (changeInfo.title || changeInfo.url) {
    await setStorageData(
      sessionStorageKeys.readyToUpdateCurrentSessionData,
      true,
    );
  }
  await updateTabGroupTreeDataAndCurrentSessionData();
});

async function createPinnedTabs({
  oldSessionData,
  newSessionData,
}: {
  oldSessionData?: SessionData;
  newSessionData?: SessionData;
}) {
  if (!oldSessionData && newSessionData) {
    const pinnedTabGroupBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
    if (pinnedTabGroupBookmarkNodeId) {
      const pinnedTabGroupBookmarkNodeChildren =
        await chrome.bookmarks.getChildren(pinnedTabGroupBookmarkNodeId);
      for (const tabData of pinnedTabGroupBookmarkNodeChildren.reverse()) {
        const url = `/stubPage.html?title=${encodeURIComponent(
          tabData.title,
        )}&url=${encodeURIComponent(tabData.url ?? "")}`;
        await chrome.tabs.create({
          url,
          pinned: true,
          active: false,
        });
      }
    } else {
      // @error
    }
  }
}

async function removeOldSessionTabs({
  oldSessionData,
  newSessionData,
  tabGroupTreeData,
}: {
  oldSessionData?: SessionData;
  newSessionData?: SessionData;
  tabGroupTreeData: TabGroupTreeData;
}) {
  for (const tabGroup of tabGroupTreeData) {
    if (
      oldSessionData &&
      newSessionData &&
      tabGroup.type === tabGroupTypes.pinned
    ) {
      continue;
    }
    for (const tab of tabGroup.tabs) {
      try {
        await setStorageData(sessionStorageKeys.currentlyRemovedTabId, tab.id);
        await chrome.tabs.remove(tab.id!);
      } catch (error) {
        console.error(error);
      }
    }
    await setStorageData(sessionStorageKeys.currentlyRemovedTabId, null);
  }
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
      const url = `/stubPage.html?title=${encodeURIComponent(
        tabData.title,
      )}&url=${encodeURIComponent(tabData.url ?? "")}${
        active ? "&active=true" : ""
      }`;
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
      tabGroup.tabs.reverse();
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
      const url = `/stubPage.html?title=${encodeURIComponent(
        oldTab.title ?? "",
      )}&url=${encodeURIComponent(oldTab.url ?? "")}${
        active ? "&active=true" : ""
      }`;
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
    const stubTabId = (await chrome.tabs.create({ active: false })).id;
    await removeOldSessionTabs({
      oldSessionData,
      newSessionData,
      tabGroupTreeData,
    });
    await createPinnedTabs({ oldSessionData, newSessionData });
    if (newSessionData) {
      await createSessionTabsFromSessionData(newSessionData);
    } else {
      await createSessionTabsFromPreviousUnsavedSessionTabGroupTreeData();
    }
    const sessionTabs = await chrome.tabs.query({
      windowType: "normal",
    });
    if (sessionTabs.length > 1) {
      await chrome.tabs.remove(stubTabId!);
    }
    await setStorageData(sessionStorageKeys.sessionLoading, false);
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

chrome.windows.onRemoved.addListener(async (windowId) => {
  await navigator.locks.request(lockNames.applyUpdates, async () => {
    const tabGroupTreeData =
      (await getStorageData<TabGroupTreeData>(
        sessionStorageKeys.tabGroupTreeData,
      )) ?? [];
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode>(
        sessionStorageKeys.currentSessionData,
      );
    const currentWindow = await chrome.windows.getCurrent({
      windowTypes: ["normal"],
    });
    if (currentWindow && currentSessionData) {
      for (const tabGroup of tabGroupTreeData) {
        const pinned = tabGroup.type === tabGroupTypes.pinned;
        if (pinned) {
          tabGroup.tabs.reverse();
        }
        const ungrouped = tabGroup.id === chrome.tabGroups.TAB_GROUP_ID_NONE;
        const tabIds: chrome.tabs.Tab["id"][] = [];
        for (const oldTab of tabGroup.tabs) {
          if (oldTab.windowId !== windowId) {
            continue;
          }
          const url = `/stubPage.html?title=${encodeURIComponent(
            oldTab.title ?? "",
          )}&url=${encodeURIComponent(oldTab.url ?? "")}`;
          try {
            await chrome.tabs.get(oldTab.id!);
          } catch (error) {
            const tab = await chrome.tabs.create({
              url,
              active: false,
            });
            tabIds.push(tab.id);
          }
        }
        if (!ungrouped && tabIds.length) {
          const { title, color } = tabGroup;
          const tabGroupId = await chrome.tabs.group({
            tabIds: tabIds as [number, ...number[]],
          });
          await chrome.tabGroups.update(tabGroupId, {
            color,
            collapsed: true,
            title,
          });
        }
      }
    }
  });
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
