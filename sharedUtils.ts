import {
  type SyncStorageKey,
  type SessionStorageKey,
  syncStorageKeys,
  rootBookmarkNodeTitle,
  AreaName,
} from "./constants";

export async function getStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
  value: T,
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].set({ [key]: value });
}

export async function subscribeToStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey,
  fn: (changes: { newValue: T; oldValue: T | undefined }) => void,
) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    const keyAreaName = key.split("-")[0] as AreaName;
    if (areaName === keyAreaName) {
      const newStorageData = changes[key]?.newValue;
      const oldStorageData = changes[key]?.oldValue;
      if (newStorageData) {
        fn({ newValue: newStorageData, oldValue: oldStorageData });
      }
    }
  });
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
