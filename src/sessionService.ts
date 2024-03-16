import { adaptState } from "promethium-js";
import {
  areaNames,
  localStorageKeys,
  sessionStorageKeys,
  syncStorageKeys,
} from "../constants";
import { notify } from "./utils";
import { getStorageData } from "../sharedUtils";

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  tabs: chrome.tabs.Tab[];
})[];

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(async () => {
  const tabGroupTreeData: TabGroupTreeData = await getStorageData(
    areaNames.local,
    localStorageKeys.tabGroupTreeData,
  );

  return tabGroupTreeData;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === areaNames.local) {
    const newTabGroupTreeData: TabGroupTreeData =
      changes[localStorageKeys.tabGroupTreeData]?.newValue;
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
    tabIds: [tab.id],
  });
}

export async function closeTabGroup(tabGroup: TabGroupTreeData[number]) {
  const tabIds = tabGroup.tabs.map((tab) => tab.id) as [number, ...number[]];
  await chrome.tabs.ungroup(tabIds);
  tabGroup.tabs.forEach(async (tab) => {
    await chrome.tabs.remove(tab.id);
  });
}

export function activateTab(tab: chrome.tabs.Tab) {
  // focus tab window first if it's not already in focus
  if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
    chrome.windows.update(tab.windowId, { focused: true });
  }
  chrome.tabs.update(tab.id, { active: true });
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
  const groupId = await chrome.tabs.group({ tabIds: tab.id });
  chrome.tabGroups.update(groupId, options);
}

export function updateTabGroup(options: {
  id: chrome.tabGroups.TabGroup["id"];
  title: chrome.tabGroups.TabGroup["title"];
  color: chrome.tabGroups.Color;
}) {
  chrome.tabGroups.update(options.id, {
    title: options.title,
    color: options.color,
  });
}

export async function createSession(title: string) {
  const rootBookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"] =
    await getStorageData(areaNames.sync, syncStorageKeys.rootBookmarkNodeId);
  const sessionData = await chrome.bookmarks.getChildren(rootBookmarkNodeId);
  // check if session with similar title already exists before proceeding
  if (sessionData.some((session) => session.title === title)) {
    notify("Session already exists", "warning");
  } else {
    await chrome.bookmarks.create({ title });
    notify("Session created successfully", "success");
  }
}

export async function updateCurrentSession(title: string) {
  const rootBookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"] =
    await getStorageData(areaNames.sync, syncStorageKeys.rootBookmarkNodeId);
  const sessionData = await chrome.bookmarks.getChildren(rootBookmarkNodeId);
  // check if session with similar title already exists before proceeding
  if (sessionData.some((session) => session.title === title)) {
    notify("Session with similar title already exists", "warning");
  } else {
    const currentSession: string = await getStorageData(
      areaNames.session,
      sessionStorageKeys.currentSession,
    );
    const rootBookmarkNodeId = await getStorageData(
      areaNames.sync,
      syncStorageKeys.rootBookmarkNodeId,
    );
    const sessionData = await chrome.bookmarks.getChildren(rootBookmarkNodeId);
    const currentSessionData = sessionData.find(
      (session) => session.title === currentSession,
    );
    await chrome.bookmarks.update(currentSessionData.id, { title });
    await chrome.storage.session.set({
      [sessionStorageKeys.currentSession]: title,
    });
    chrome.storage.local.set({ [localStorageKeys.lastSession]: title });
  }
}

export async function deleteCurrentSession() {
  const currentSession: string = await getStorageData(
    areaNames.session,
    sessionStorageKeys.currentSession,
  );
  const rootBookmarkNodeId = await getStorageData(
    areaNames.sync,
    syncStorageKeys.rootBookmarkNodeId,
  );
  const sessionData = await chrome.bookmarks.getChildren(rootBookmarkNodeId);
  const currentSessionData = sessionData.find(
    (session) => session.title === currentSession,
  );
  await chrome.bookmarks.removeTree(currentSessionData.id);
  await chrome.storage.session.remove(sessionStorageKeys.currentSession);
  chrome.storage.local.remove(localStorageKeys.lastSession);
}
