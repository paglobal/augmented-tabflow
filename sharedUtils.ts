import {
  SyncStorageKey,
  SessionStorageKey,
  AreaName,
  TabGroupType,
  tabGroupTypes,
  sessionStorageKeys,
  MessageType,
  lockNames,
  stubPagePathName,
  protocolsEligibleForEncoding,
  LocalStorageKey,
  localStorageKeys,
  syncStorageKeys,
  bookmarkerDetails,
  otherBookmarksBookmarkNodeTitle,
} from "./constants";

export async function getStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey | LocalStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey | LocalStorageKey,
  value: T,
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].set({ [key]: value });
}

export async function removeStorageData(
  key: SyncStorageKey | SessionStorageKey | LocalStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].remove(key);
}

export async function subscribeToStorageData<T = unknown>(
  key: SyncStorageKey | SessionStorageKey | LocalStorageKey,
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

export async function createBookmarkNodeAndStoreId(
  localStorageKey: LocalStorageKey,
  bookmarkNodeTitle: string,
) {
  await navigator.locks.request(lockNames.createBookmarkNode, async () => {
    try {
      const bookmarkTree = await chrome.bookmarks.getTree();
      const otherBookmarksBookmarkNodeId = bookmarkTree[0].children?.find(
        (bookmark) => bookmark.title === otherBookmarksBookmarkNodeTitle,
      )?.id;
      const syncRootBookmarkNodeId = await getStorageData<
        chrome.bookmarks.BookmarkTreeNode["id"]
      >(syncStorageKeys.rootBookmarkNodeId);
      const syncPinnedTabGroupBookmarkNodeId = await getStorageData<
        chrome.bookmarks.BookmarkTreeNode["id"]
      >(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
      if (syncRootBookmarkNodeId) {
        await setStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
          localStorageKeys.rootBookmarkNodeId,
          syncRootBookmarkNodeId,
        );
        await removeStorageData(syncStorageKeys.rootBookmarkNodeId);
      }
      if (syncPinnedTabGroupBookmarkNodeId) {
        await setStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
          localStorageKeys.pinnedTabGroupBookmarkNodeId,
          syncPinnedTabGroupBookmarkNodeId,
        );
        await removeStorageData(syncStorageKeys.pinnedTabGroupBookmarkNodeId);
      }
      const bookmarkNodeId =
        await getStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
          localStorageKey,
        );
      let parentId: chrome.bookmarks.BookmarkTreeNode["id"] | undefined;
      if (localStorageKey === localStorageKeys.pinnedTabGroupBookmarkNodeId) {
        parentId = await getStorageData<
          chrome.bookmarks.BookmarkTreeNode["id"]
        >(localStorageKeys.rootBookmarkNodeId);
      } else {
        parentId = otherBookmarksBookmarkNodeId;
      }
      try {
        const bookmarkNode = (await chrome.bookmarks.get(bookmarkNodeId!))[0];
        // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case
        if (!bookmarkNode && parentId) {
          const bookmarkNodeId = (
            await chrome.bookmarks.create({
              title: bookmarkNodeTitle,
              parentId: parentId,
            })
          ).id;
          await setStorageData(localStorageKey, bookmarkNodeId);
        }
      } catch (error) {
        const bookmarkNodeId = (
          await chrome.bookmarks.create({ title: bookmarkNodeTitle, parentId })
        ).id;
        await setStorageData(localStorageKey, bookmarkNodeId);
      }
      const _bookmarkNodeId =
        await getStorageData<chrome.bookmarks.BookmarkTreeNode["id"]>(
          localStorageKey,
        );
      if (_bookmarkNodeId && parentId) {
        await insertBookmarker(_bookmarkNodeId);
        const eligibleBookmarkNodes = (
          await Promise.all(
            (await chrome.bookmarks.getChildren(parentId)).map(
              async (bookmarkNode) => {
                const bookmarkNodeChildren = await chrome.bookmarks.getChildren(
                  bookmarkNode.id,
                );

                return bookmarkNodeChildren.some(
                  (bookmarkNode) =>
                    bookmarkNode.title === bookmarkerDetails.title &&
                    bookmarkNode.url === bookmarkerDetails.url,
                )
                  ? bookmarkNode
                  : false;
              },
            ),
          )
        ).filter(Boolean);
        await migrateAndDedupe(
          eligibleBookmarkNodes as Array<chrome.bookmarks.BookmarkTreeNode>,
          _bookmarkNodeId,
        );
        const bookmarkers: Array<chrome.bookmarks.BookmarkTreeNode> = (
          await chrome.bookmarks.getChildren(_bookmarkNodeId)
        ).filter(
          (bookmarkNode) =>
            bookmarkNode.title === bookmarkerDetails.title &&
            bookmarkNode.url === bookmarkerDetails.url,
        );
        if (bookmarkers[0].id) {
          await migrateAndDedupe(bookmarkers, bookmarkers[0].id);
        }
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

export function encodeTabDataAsUrl(options: {
  title: string;
  url: string;
  active?: boolean;
}) {
  const urlFromUrl = new URL(options.url);
  if (protocolsEligibleForEncoding.includes(urlFromUrl.protocol)) {
    return `${stubPagePathName}?title=${encodeURIComponent(
      options.title ?? "",
    )}&url=${encodeURIComponent(options.url ?? "")}${
      options.active ? "&active=true" : ""
    }`;
  } else {
    return options.url;
  }
}

export function debounce(callback: () => void, timeout: number) {
  let timeoutId: number | undefined;

  return (newTimeout?: number) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback();
    }, newTimeout ?? timeout);
  };
}

export async function insertBookmarker(
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  // @maybe the error shouldn't be handled here
  try {
    await chrome.bookmarks.create({
      title: bookmarkerDetails.title,
      url: bookmarkerDetails.url,
      parentId: bookmarkNodeId,
      index: 0,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function migrateAndDedupe(
  bookmarkNodes: Array<chrome.bookmarks.BookmarkTreeNode>,
  masterBookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"],
) {
  // @maybe the error shouldn't be handled here
  try {
    for (const bookmarkNode of bookmarkNodes) {
      if (bookmarkNode.id !== masterBookmarkNodeId) {
        const bookmarkNodeChildren = await chrome.bookmarks.getChildren(
          bookmarkNode.id,
        );
        for (const bookmarkNode of bookmarkNodeChildren) {
          await chrome.bookmarks.move(bookmarkNode.id, {
            parentId: masterBookmarkNodeId,
          });
        }
        await chrome.bookmarks.remove(bookmarkNode.id);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export function wait(timeout?: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export async function withError<T>(
  promise: Promise<T>,
): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      return [error];
    });
}
