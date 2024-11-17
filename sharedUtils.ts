import {
  SessionStorageKey,
  TabGroupType,
  AreaName,
  tabGroupTypes,
  sessionStorageKeys,
  MessageType,
  lockNames,
  stubPagePathName,
  protocolsEligibleForEncoding,
  LocalStorageKey,
  localStorageKeys,
  bookmarkerDetails,
  otherBookmarksBookmarkNodeTitle,
  CurrentlyNavigatedTabId,
  newTabNavigatedTabId,
  navigationBoxPathName,
  AntecedentTabInfo,
} from "./constants";
import { currentTabGroupSpaceColor } from "./src/sessionService";

export async function getStorageData<T = unknown>(
  key: SessionStorageKey | LocalStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T = unknown>(
  key: SessionStorageKey | LocalStorageKey,
  value: T,
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].set({ [key]: value });
}

export async function removeStorageData(
  key: SessionStorageKey | LocalStorageKey,
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].remove(key);
}

export async function subscribeToStorageData<T = unknown>(
  key: SessionStorageKey | LocalStorageKey,
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

async function reinitializePinnedTabs() {
  // @maybe
  await setStorageData(sessionStorageKeys.sessionLoading, true);
  const oldPinnedTabs = await chrome.tabs.query({ pinned: true });
  for (const tab of oldPinnedTabs) {
    try {
      await setStorageData(sessionStorageKeys.currentlyRemovedTabId, tab.id);
      await chrome.tabs.remove(tab.id!);
    } catch (error) {
      console.error(error);
    }
  }
  const pinnedTabGroupBookmarkNodeId = await getStorageData<
    chrome.bookmarks.BookmarkTreeNode["id"]
  >(localStorageKeys.pinnedTabGroupBookmarkNodeId);
  if (pinnedTabGroupBookmarkNodeId) {
    const pinnedTabGroupBookmarkNodeChildren =
      await chrome.bookmarks.getChildren(pinnedTabGroupBookmarkNodeId);
    for (const tabData of pinnedTabGroupBookmarkNodeChildren) {
      if (
        tabData.title === bookmarkerDetails.title &&
        tabData.url === bookmarkerDetails.url
      ) {
        continue;
      }
      const url = encodeTabDataAsUrl({
        title: tabData.title,
        url: tabData.url || "",
      });
      await chrome.tabs.create({
        url,
        pinned: true,
        active: false,
      });
    }
  } else {
    // @error
  }
  await setStorageData(sessionStorageKeys.sessionLoading, false);
}

export async function createBookmarkNodeAndStoreId(
  localStorageKey: LocalStorageKey,
  bookmarkNodeTitle: string,
) {
  await navigator.locks.request(lockNames.createBookmarkNode, async () => {
    try {
      // get `Other Bookmarks` folder id
      const bookmarkTree = await chrome.bookmarks.getTree();
      const otherBookmarksBookmarkNodeId = bookmarkTree[0].children?.find(
        (bookmark) => bookmark.title === otherBookmarksBookmarkNodeTitle,
      )?.id;
      // get stored id of bookmark node and it's parent id if it's the pinned bookmarks folder
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
      // try to get bookmark node by id
      try {
        const bookmarkNode = (await chrome.bookmarks.get(bookmarkNodeId!))[0];
        // this isn't even necessary because `chrome.bookmarks.get` will error if our bookmark id is invalid...but just in case
        if (!bookmarkNode && parentId) {
          const bookmarkNodeId = (
            await chrome.bookmarks.create({
              title: bookmarkNodeTitle,
              parentId,
            })
          ).id;
          await setStorageData(localStorageKey, bookmarkNodeId);
        }
        // if unsuccessful, create new bookmark node and store id
      } catch (error) {
        const bookmarkNodeId = (
          await chrome.bookmarks.create({ title: bookmarkNodeTitle, parentId })
        ).id;
        await setStorageData(localStorageKey, bookmarkNodeId);
      }
      // insert bookmarker in bookmark node and dedupe bookmark node contents
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
        // reinitialize pinned tabs if the pinned bookmark node contents have changed
        if (
          eligibleBookmarkNodes[1] &&
          localStorageKey === localStorageKeys.pinnedTabGroupBookmarkNodeId
        ) {
          await reinitializePinnedTabs();
        }
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

export function debounce<T>(callback: (args?: T) => void, timeout: number) {
  let timeoutId: number | undefined | NodeJS.Timeout;

  return (args?: T, newTimeout?: number) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(args);
    }, newTimeout ?? timeout);
  };
}

export function executeAndBounceOff<T>(
  callback: (args?: T) => void,
  timeout: number,
) {
  let timeoutId: number | undefined | NodeJS.Timeout;
  let bounceOff: boolean = false;

  return (args?: T, newTimeout?: number) => {
    if (!bounceOff) {
      callback(args);
      bounceOff = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        bounceOff = false;
      }, newTimeout ?? timeout);
    }
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

export async function openNavigationBox<
  T extends {
    active?: boolean;
    pinned?: boolean;
    newWindow?: boolean;
    navigatedTabId?: chrome.tabs.Tab["id"];
    precedentTabId: chrome.tabs.Tab["id"];
    group?: boolean;
  },
>(
  options: T,
): Promise<
  T["newWindow"] extends true
    ? chrome.windows.Window | undefined
    : chrome.tabs.Tab | undefined
> {
  const [error] = await withError(
    setStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo, {
      precedentTabId: options.precedentTabId,
    }),
  );
  if (error) {
    // @handle
  }
  await setStorageData<CurrentlyNavigatedTabId>(
    sessionStorageKeys.currentlyNavigatedTabId,
    options?.navigatedTabId ?? newTabNavigatedTabId,
  );
  if (options?.newWindow) {
    return (await chrome.windows.create({
      url: navigationBoxPathName,
      focused: true,
      type: "normal",
    })) as T["newWindow"] extends true
      ? chrome.windows.Window | undefined
      : chrome.tabs.Tab | undefined;
  } else {
    return (await chrome.tabs.create({
      url: `${navigationBoxPathName}${options?.group ? "?group=true" : ""}`,
      active: options?.active,
      pinned: options?.pinned,
    })) as T["newWindow"] extends true
      ? chrome.windows.Window | undefined
      : chrome.tabs.Tab | undefined;
  }
}

export async function createTabGroup(tab?: chrome.tabs.Tab) {
  // @maybe
  if (!tab) {
    const [error, currentTab] = await withError(chrome.tabs.getCurrent());
    if (error) {
      //@handle
    }
    tab = await openNavigationBox({
      active: false,
      precedentTabId: currentTab?.id,
      group: true,
    });
  } else {
    if (tab.id) {
      const tabGroupId = await chrome.tabs.group({
        tabIds: tab.id,
        createProperties: {
          windowId: tab.windowId,
        },
      });
      await chrome.tabGroups.move(tabGroupId, { index: -1 });
      const _currentTabGroupSpaceColor = currentTabGroupSpaceColor();
      if (_currentTabGroupSpaceColor && _currentTabGroupSpaceColor !== "sky") {
        chrome.tabGroups.update(tabGroupId, {
          color: _currentTabGroupSpaceColor,
        });
      }
    }
  }
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { active: true });
  }
}
