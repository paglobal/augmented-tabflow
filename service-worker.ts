import { type TabGroupTreeData as ActiveTabGroupTreeData } from "./src/services/active";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

type TabGroupTreeData = Record<
  chrome.tabGroups.TabGroup["id"],
  ActiveTabGroupTreeData[number]
>;

// copied into `src/constants.ts` because of some issues with directly importing
export const rootBookmarkNodeTitle =
  "___augmented-tabflow-root-bookmark-node___";

// copied from `src/constants.ts` because of some issues with directly importing
export const syncStorageKeys = {
  rootBookmarkNodeId: "1",
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

let tabGroupTreeData: TabGroupTreeData = {};
let tabGroupTreeDataUpdateTimeoutId: number | null = null;
const updatedTabGroups: chrome.tabGroups.TabGroup[] = [];
const removedTabGroups: chrome.tabGroups.TabGroup[] = [];

async function handleUpdatedTabGroups(
  newTabGroupTreeData: TabGroupTreeData,
  rootBookmarkNodeChildren: chrome.bookmarks.BookmarkTreeNode[],
) {
  const arrayifiedTabGroupTreeData = Object.values(tabGroupTreeData);
  for (const updatedTabGroup of updatedTabGroups) {
    if (
      newTabGroupTreeData[updatedTabGroup.id] &&
      tabGroupTreeData[updatedTabGroup.id]
    ) {
      // check if this tab group qualifies as a saved tab group before proceeding
      const bookmarkNode = rootBookmarkNodeChildren.find(
        (bookmarkNode) =>
          `${tabGroupTreeData[updatedTabGroup.id].color}-${
            tabGroupTreeData[updatedTabGroup.id].title
          }` === bookmarkNode.title,
      );
      if (bookmarkNode) {
        // don't proceed if there were any tab groups with the same title and color as the old title and color
        if (
          arrayifiedTabGroupTreeData.filter(
            (tabGroup) =>
              tabGroup.title === tabGroupTreeData[updatedTabGroup.id].title &&
              tabGroup.color === tabGroupTreeData[updatedTabGroup.id].color,
          ).length === 1
        ) {
          // don't proceed if there are any bookmarks in our root bookmark node that have a title and color that corresponds with this update
          const newBookmarkNodeTitle = `${updatedTabGroup.color}-${updatedTabGroup.title}`;
          if (
            !rootBookmarkNodeChildren.some(
              (bookmarkNode) => newBookmarkNodeTitle === bookmarkNode.title,
            )
          ) {
            chrome.bookmarks.update(bookmarkNode.id, {
              title: newBookmarkNodeTitle,
            });
          }
        }
      }
    }
  }
  updatedTabGroups.length = 0;
}

async function handleRemovedTabGroups(
  newTabGroupTreeData: TabGroupTreeData,
  rootBookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"],
  rootBookmarkNodeChildren: chrome.bookmarks.BookmarkTreeNode[],
) {
  const newBookmarkNodeInfo: Record<
    chrome.bookmarks.BookmarkTreeNode["id"],
    { title: string; tabs: chrome.tabs.Tab[][] }
  > = {};
  newBookmarkNodeInfo;
  const arrayifiedNewTabGroupTreeData = Object.values(newTabGroupTreeData);
  for (const removedTabGroup of removedTabGroups) {
    if (tabGroupTreeData[removedTabGroup.id]) {
      // check if this tab group qualifies as a saved tab group before proceeding
      const bookmarkNode = rootBookmarkNodeChildren.find(
        (bookmarkNode) =>
          `${tabGroupTreeData[removedTabGroup.id].color}-${
            tabGroupTreeData[removedTabGroup.id].title
          }` === bookmarkNode.title,
      );
      if (bookmarkNode) {
        // don't proceed if there are any existing tab groups with the same title and color as the removed tab group title and color
        if (
          arrayifiedNewTabGroupTreeData.filter(
            (tabGroup) =>
              tabGroup.title === removedTabGroup.title &&
              tabGroup.color === removedTabGroup.color,
          ).length === 0
        ) {
          const bookmarkNodeId = bookmarkNode.id;
          if (!newBookmarkNodeInfo[bookmarkNodeId]) {
            newBookmarkNodeInfo[bookmarkNodeId] = {
              title: bookmarkNode.title,
              tabs: [],
            };
          }
          newBookmarkNodeInfo[bookmarkNodeId].tabs.push(
            tabGroupTreeData[removedTabGroup.id].tabs,
          );
        }
      }
    }
  }
  const arrayifiedNewBookmarkNodeInfo = Object.entries(newBookmarkNodeInfo);
  for await (const newBookmarkNodeInfo of arrayifiedNewBookmarkNodeInfo) {
    const bookmarkNodeId = newBookmarkNodeInfo[0];
    const bookmarkNodeTitle = newBookmarkNodeInfo[1].title;
    const newBookmarkNodeTabs = newBookmarkNodeInfo[1].tabs.flat();
    await chrome.bookmarks.removeTree(bookmarkNodeId);
    const newBookmarkNode = await chrome.bookmarks.create({
      title: bookmarkNodeTitle,
      parentId: rootBookmarkNodeId,
    });
    for await (const bookmarkNodeTab of newBookmarkNodeTabs) {
      await chrome.bookmarks.create({
        title: bookmarkNodeTab.title,
        url: bookmarkNodeTab.url,
        parentId: newBookmarkNode.id,
      });
    }
  }
  removedTabGroups.length = 0;
}

async function updateTabGroupTreeData() {
  clearTimeout(tabGroupTreeDataUpdateTimeoutId);
  tabGroupTreeDataUpdateTimeoutId = setTimeout(async () => {
    const tabGroups = await chrome.tabGroups.query({});
    const newTabGroupTreeData: Record<
      chrome.tabGroups.TabGroup["id"],
      TabGroupTreeData[number]
    > = {};
    for await (const tabGroup of tabGroups) {
      const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
      newTabGroupTreeData[tabGroup.id] = { ...tabGroup, tabs };
    }
    const rootBookmarkNodeId = (
      await chrome.storage.sync.get(syncStorageKeys.rootBookmarkNodeId)
    )[syncStorageKeys.rootBookmarkNodeId];
    const rootBookmarkNodeChildren =
      await chrome.bookmarks.getChildren(rootBookmarkNodeId);
    handleUpdatedTabGroups(newTabGroupTreeData, rootBookmarkNodeChildren);
    handleRemovedTabGroups(
      newTabGroupTreeData,
      rootBookmarkNodeId,
      rootBookmarkNodeChildren,
    );
    tabGroupTreeData = newTabGroupTreeData;
  }, 200);
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

chrome.tabGroups.onUpdated.addListener((tabGroup) => {
  updatedTabGroups.push(tabGroup);
  updateTabGroupTreeData();
});

chrome.tabGroups.onRemoved.addListener((tabGroup) => {
  removedTabGroups.push(tabGroup);
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
