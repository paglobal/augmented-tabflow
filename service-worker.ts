import {
  syncStorageKeys,
  rootBookmarkNodeTitle,
  localStorageKeys,
} from "./src/constants";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// TODO: handle errors with async communication between sidepanel page and this worker
async function initRootBookmarkNode() {
  const result = await chrome.storage.sync.get(
    syncStorageKeys.rootBookmarkNodeId,
  );
  let rootBookmarkNode = null;
  try {
    rootBookmarkNode = (
      await chrome.bookmarks.get(result[syncStorageKeys.rootBookmarkNodeId])
    )[0];
    if (rootBookmarkNode.title !== rootBookmarkNodeTitle) {
      const rootBookmarkNodeId = (
        await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
      ).id;
      chrome.storage.sync.set({
        [syncStorageKeys.rootBookmarkNodeId]: rootBookmarkNodeId,
      });
    }
  } catch (e) {
    const rootBookmarkNodeId = (
      await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
    ).id;
    chrome.storage.sync.set({
      [syncStorageKeys.rootBookmarkNodeId]: rootBookmarkNodeId,
    });
  }
}

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  tabs: chrome.tabs.Tab[];
})[];

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
  chrome.storage.local.set({
    [localStorageKeys.tabGroupTreeData]: tabGroupTreeData,
  });
}

// TODO: implement saving of sessions (on startup and on session switch)
async function updateTabGroupTreeData() {
  if (!debounceTabGroupTreeDataUpdates) {
    applyUpdates();
    debounceTabGroupTreeDataUpdates = true;
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    tabGroupTreeDataUpdateTimeoutId = setTimeout(() => {
      debounceTabGroupTreeDataUpdates = false;
    }, 1000);
  } else {
    clearTimeout(tabGroupTreeDataUpdateTimeoutId);
    tabGroupTreeDataUpdateTimeoutId = setTimeout(() => {
      debounceTabGroupTreeDataUpdates = false;
      applyUpdates();
    }, 1000);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  initRootBookmarkNode();
  updateTabGroupTreeData();
});

chrome.runtime.onStartup.addListener(() => {
  initRootBookmarkNode();
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
