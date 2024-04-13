import { adaptState } from "promethium-js";
import { areaNames, sessionStorageKeys, syncStorageKeys } from "../constants";
import { notify } from "./utils";
import { getStorageData } from "../sharedUtils";

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  tabs: chrome.tabs.Tab[];
})[];

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(async () => {
  const tabGroupTreeData = await getStorageData<TabGroupTreeData>(
    sessionStorageKeys.tabGroupTreeData,
  );

  return tabGroupTreeData ?? [];
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === areaNames.session) {
    const newTabGroupTreeData: TabGroupTreeData =
      changes[sessionStorageKeys.tabGroupTreeData]?.newValue;
    if (newTabGroupTreeData) {
      setTabGroupTreeData(newTabGroupTreeData);
    }
  }
});

export function expandTabGroup(tabGroup: chrome.tabGroups.TabGroup) {
  chrome.tabGroups.update(tabGroup.id, {
    collapsed: false,
  });
}

export function collapseTabGroup(tabGroup: chrome.tabGroups.TabGroup) {
  chrome.tabGroups.update(tabGroup.id, {
    collapsed: true,
  });
}

export async function addTabToTabGroup(tabGroup: chrome.tabGroups.TabGroup) {
  const tab = await chrome.tabs.create({});
  chrome.tabs.group({
    groupId: tabGroup.id,
    tabIds: tab.id as number,
  });
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
  id: chrome.tabGroups.TabGroup["id"] | null,
  options: {
    title: chrome.tabGroups.TabGroup["title"];
    color: chrome.tabGroups.Color;
  },
) {
  if (id) {
    chrome.tabGroups.update(id, {
      title: options.title,
      color: options.color,
    });
  }
}

export const [currentSession, setCurrentSession] = adaptState<
  chrome.bookmarks.BookmarkTreeNode["id"] | null | undefined
>(null);

async function updateCurrentSession(
  newSession?: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  if (newSession) {
    setCurrentSession(newSession);
  } else {
    const currentSession = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(sessionStorageKeys.currentSession);

    setCurrentSession(currentSession);
  }
}

updateCurrentSession();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === areaNames.session) {
    const newCurrentSession: chrome.bookmarks.BookmarkTreeNode["id"] =
      changes[sessionStorageKeys.currentSession]?.newValue;
    if (newCurrentSession) {
      setCurrentSession(newCurrentSession);
    }
  }
});

export const [sessionTreeData, setSessionTreeData] = adaptState<
  | chrome.bookmarks.BookmarkTreeNode[]
  | Promise<chrome.bookmarks.BookmarkTreeNode[]>
>(async () => {
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    const sessionTreeData =
      await chrome.bookmarks.getChildren(rootBookmarkNodeId);

    return sessionTreeData ?? [];
  } else {
    return [];
  }
});

async function updateSessionTreeData() {
  const rootBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(syncStorageKeys.rootBookmarkNodeId);
  if (rootBookmarkNodeId) {
    const sessionTreeData =
      await chrome.bookmarks.getChildren(rootBookmarkNodeId);
    setSessionTreeData(sessionTreeData);
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
      for await (const tabGroup of tabGroupTreeData) {
        const tabGroupBookmarkId = (
          await chrome.bookmarks.create({
            parentId: session,
            title: `${tabGroup.color}-${tabGroup.title}`,
          })
        ).id;
        for await (const tab of tabGroup.tabs) {
          await chrome.bookmarks.create({
            parentId: tabGroupBookmarkId,
            title: tab.title,
            url: tab.url,
          });
        }
      }
    }
  }
  notify("Session created successfully", "success");
}

export async function updateCurrentSessionTitle(title: string) {
  const currentSession = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(sessionStorageKeys.currentSession);
  if (currentSession) {
    await chrome.bookmarks.update(currentSession, { title });
  } else {
    notify("Session does not exist", "danger");
  }
}

export async function deleteSession(
  session: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  await chrome.bookmarks.removeTree(session);
  await chrome.storage.session.remove(sessionStorageKeys.currentSession);
}
