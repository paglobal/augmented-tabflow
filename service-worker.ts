chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// copied from `src/globals.ts` because of some issues with directly importing
// an update here should reflect there!
export const rootBookmarkNodeTitle = "Augmented Tabflow Saved Tab Groups";

// TODO: implement migrations for storage using `onInstalled`
// copied from `src/globals.ts` because of some issues with directly importing
// an update here should reflect there!
const syncStorageKeys = {
  rootBookmarkNodeId: "1",
} as const;

const localStorageKeys = {
  tabGroupTreeData: "1",
} as const;

// TODO: we'll handle errors later with async communication between sidepanel page and this worker
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

let tabGroupTreeDataUpdateTimeoutId: number | null = null;

async function updateTabGroupTreeData() {
  clearTimeout(tabGroupTreeDataUpdateTimeoutId);
  tabGroupTreeDataUpdateTimeoutId = setTimeout(async () => {}, 200);
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

chrome.tabGroups.onUpdated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabGroups.onRemoved.addListener(() => {
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
// TODO: optimize this using some sort of queue or debouncing or something
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
