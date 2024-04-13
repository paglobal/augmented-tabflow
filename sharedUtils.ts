import {
  type SyncStorageKey,
  type SessionStorageKey,
  syncStorageKeys,
  rootBookmarkNodeTitle,
  areaNames,
} from "./constants";

export async function getStorageData<T>(
  key: SyncStorageKey | SessionStorageKey,
) {
  const areaName = key.split("-")[0] as keyof typeof areaNames;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T>(
  key: SyncStorageKey | SessionStorageKey,
  value: T,
) {
  const areaName = key.split("-")[0] as keyof typeof areaNames;
  chrome.storage[areaName].set({ [key]: value });
}

export async function createRootBookmarkNode() {
  try {
    const rootBookmarkNodeId = await getStorageData<
      chrome.bookmarks.BookmarkTreeNode["id"]
    >(syncStorageKeys.rootBookmarkNodeId);
    try {
      if (rootBookmarkNodeId) {
        const rootBookmarkNode = (
          await chrome.bookmarks.get(rootBookmarkNodeId)
        )[0];
        // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid
        // but just in case!
        if (!rootBookmarkNode) {
          const rootBookmarkNodeId = (
            await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
          ).id;
          setStorageData(
            syncStorageKeys.rootBookmarkNodeId,
            rootBookmarkNodeId,
          );
        }
      }
    } catch (e) {
      const rootBookmarkNodeId = (
        await chrome.bookmarks.create({ title: rootBookmarkNodeTitle })
      ).id;
      setStorageData(syncStorageKeys.rootBookmarkNodeId, rootBookmarkNodeId);
    }
  } catch (e) {
    // no error handling here. we'll do that in the sidepanel ui
  }
}
