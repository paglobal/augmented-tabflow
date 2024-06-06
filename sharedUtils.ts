import {
  type SyncStorageKey,
  type SessionStorageKey,
  syncStorageKeys,
  AreaName,
  TabGroupType,
  tabGroupTypes,
  sessionStorageKeys,
  MessageType,
  lockNames,
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
  fn: (changes: { newValue: T | undefined; oldValue: T | undefined }) => void,
) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    const keyAreaName = key.split("-")[0] as AreaName;
    if (areaName === keyAreaName) {
      const newStorageData = changes[key]?.newValue;
      const oldStorageData = changes[key]?.oldValue;
      if (newStorageData !== undefined || oldStorageData !== undefined) {
        fn({ newValue: newStorageData, oldValue: oldStorageData });
      }
    }
  });
}

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  type?: TabGroupType;
  icon?: string;
  tabs: chrome.tabs.Tab[];
})[];

export async function createBookmarkNodeAndSyncId(
  syncStorageKey: SyncStorageKey,
  bookmarkNodeTitle: string,
) {
  await navigator.locks.request(lockNames.createBookmarkNode, async () => {
    try {
      const bookmarkNodeId =
        await getStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
          syncStorageKey,
        );
      let parentId: chrome.bookmarks.BookmarkTreeNode["id"] | undefined;
      if (syncStorageKey === syncStorageKeys.pinnedTabGroupBookmarkNodeId) {
        parentId = await getStorageData<
          chrome.bookmarks.BookmarkTreeNode["id"]
        >(syncStorageKeys.rootBookmarkNodeId);
      }
      try {
        const bookmarkNode = (await chrome.bookmarks.get(bookmarkNodeId!))[0];
        // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case
        if (!bookmarkNode) {
          const bookmarkNodeId = (
            await chrome.bookmarks.create({
              title: bookmarkNodeTitle,
              parentId,
            })
          ).id;
          await setStorageData(syncStorageKey, bookmarkNodeId);
        }
      } catch (error) {
        const bookmarkNodeId = (
          await chrome.bookmarks.create({ title: bookmarkNodeTitle, parentId })
        ).id;
        await setStorageData(syncStorageKey, bookmarkNodeId);
      }
    } catch (error) {
      // no error handling here. we'll do that in the sidepanel ui
    }
  });
}

export async function sendMessage(
  message: { type: MessageType; data?: any },
  fn?: (response: any) => void,
) {
  chrome.runtime.sendMessage(
    {
      type: message.type,
      data: message.data,
    },
    // @ts-ignore. looks like `chrome.runtime.sendMessage` was typed incorrectly
    fn,
  );
}

export function subscribeToMessage(
  messageType: MessageType,
  fn: (
    data: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void,
  ) => void,
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type && message.type === messageType) {
      fn(message.data, sender, sendResponse);
    }

    return undefined;
    // not being used currently because of errors. only use if you plan to send a response
    // TODO: revise this (if necessary)
    // return true;
  });
}

export async function saveCurrentSessionDataIntoBookmarkNode(
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData,
    )) ?? [];
  for (const tabGroup of tabGroupTreeData) {
    if (tabGroup.type === tabGroupTypes.pinned) {
      continue;
    }
    const tabGroupDataId = (
      await chrome.bookmarks.create({
        parentId: bookmarkNodeId,
        title: tabGroup.icon
          ? tabGroup.title
          : `${tabGroup.color}-${tabGroup.title}`,
      })
    ).id;
    for (const tab of tabGroup.tabs) {
      await chrome.bookmarks.create({
        parentId: tabGroupDataId,
        title: tab.title,
        url: tab.url,
      });
    }
  }
}

export function getFaviconUrl(pageUrl: string | null | undefined) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl ?? "null");
  url.searchParams.set("size", "32");

  return url.toString();
}
