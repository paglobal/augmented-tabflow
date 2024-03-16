import { syncStorageKeys, rootBookmarkNodeTitle, areaNames } from "./constants";

export async function getStorageData(
  areaName: keyof typeof areaNames,
  key: string,
) {
  return (await chrome.storage[areaName].get(key))[key];
}

export async function createRootBookmarkNode() {
  try {
    const rootBookmarkNodeId = await getStorageData(
      areaNames.sync,
      syncStorageKeys.rootBookmarkNodeId,
    );
    try {
      const rootBookmarkNode = (
        await chrome.bookmarks.get(rootBookmarkNodeId)
      )[0];
      // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid
      // but just in case!
      if (!rootBookmarkNode) {
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
  } catch (e) {
    // no error handling here. we'll do that later in the sidepanel ui
  }
}
