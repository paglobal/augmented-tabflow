import {
  MessageType,
  messageTypes,
  sessionStorageKeys,
  tabGroupTypes,
} from "./constants";
import {
  createRootBookmarkNode,
  getStorageData,
  setStorageData,
} from "./sharedUtils";
import { type TabGroupTreeData } from "./src/sessionService";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message) => {
  if (message === messageTypes.updateTabGroupTreeData) {
    updateTabGroupTreeData();
  }

  return undefined;
});

async function getTabGroupTreeData() {
  const tabGroups = await chrome.tabGroups.query({});
  const tabs = await chrome.tabs.query({});

  const tabGroupTreeData = tabs.reduce<TabGroupTreeData>(
    (tabGroupTreeData, currentTab) => {
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
  });

  const ungroupedTabGroupCollapsed = await getStorageData<boolean>(
    sessionStorageKeys.ungroupedTabGroupCollapsed,
  );

  if (ungroupedTabs.length) {
    console.log(ungroupedTabGroupCollapsed);
    tabGroupTreeData.push({
      id: null as unknown as chrome.tabGroups.TabGroup["id"],
      type: tabGroupTypes.ungrouped,
      color: null as unknown as chrome.tabGroups.Color,
      windowId: null as unknown as NonNullable<chrome.windows.Window["id"]>,
      title: "Ungrouped",
      icon: "folder2-open",
      collapsed: ungroupedTabGroupCollapsed ?? true,
      tabs: ungroupedTabs,
    });
  }

  return tabGroupTreeData;
}

async function applyUpdates() {
  const tabGroupTreeData = await getTabGroupTreeData();
  setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
}

async function updateTabGroupTreeData() {
  const debounceTabGroupTreeDataUpdates = await getStorageData<boolean>(
    sessionStorageKeys.debounceTabGroupTreeDataUpdates,
  );
  const tabGroupTreeDataUpdateTimeoutId = await getStorageData<
    number | undefined
  >(sessionStorageKeys.tabGroupTreeDataUpdateTimeoutId);
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
      }, 200),
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
      }, 200),
    );
  }
}

chrome.runtime.onInstalled.addListener(() => {
  createRootBookmarkNode();
  updateTabGroupTreeData();
});

chrome.runtime.onStartup.addListener(() => {
  createRootBookmarkNode();
  updateTabGroupTreeData();
});

updateTabGroupTreeData();

chrome.tabGroups.onCreated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabGroups.onRemoved.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabGroups.onUpdated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onActivated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onAttached.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onCreated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onDetached.addListener(() => {
  updateTabGroupTreeData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onRemoved.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onReplaced.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onUpdated.addListener(() => {
  updateTabGroupTreeData();
});
