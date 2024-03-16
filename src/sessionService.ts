import { adaptState } from "promethium-js";
import { areaNames, localStorageKeys } from "./constants";

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  tabs: chrome.tabs.Tab[];
})[];

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(async () => {
  const tabGroupTreeData: TabGroupTreeData = (
    await chrome.storage.local.get(localStorageKeys.tabGroupTreeData)
  )[localStorageKeys.tabGroupTreeData];

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
    // TODO: display warning modal here
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
  // check if session exists and show error alert if it does
  if() {

  // show success alert if successful 
  } else {

  }
}

export async function updateCurrentSession(title: string) {
  // check if session exists and show error alert if it does
  if() {

  } else {

  }
}

export async function deleteCurrentSession() {
  // show success alert if successful 
}
