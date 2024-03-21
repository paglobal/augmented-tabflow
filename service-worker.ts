import { sessionStorageKeys } from "./constants";
import { createRootBookmarkNode, setStorageData } from "./sharedUtils";
import { type TabGroupTreeData } from "./src/sessionService";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

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

  return tabGroupTreeData;
}

let debounceTabGroupTreeDataUpdates = false;
let tabGroupTreeDataUpdateTimeoutId: number | null = null;

async function applyUpdates() {
  const tabGroupTreeData = await getTabGroupTreeData();
  setStorageData(sessionStorageKeys.tabGroupTreeData, tabGroupTreeData);
}

// TODO: implement saving of sessions (on startup and on session switch)
async function updateTabGroupTreeData() {
  if (!debounceTabGroupTreeDataUpdates) {
    applyUpdates();
    debounceTabGroupTreeDataUpdates = true;
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    tabGroupTreeDataUpdateTimeoutId = setTimeout(() => {
      debounceTabGroupTreeDataUpdates = false;
    }, 200);
  } else {
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    tabGroupTreeDataUpdateTimeoutId = setTimeout(() => {
      debounceTabGroupTreeDataUpdates = false;
      applyUpdates();
    }, 200);
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
