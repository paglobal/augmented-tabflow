import {
  SessionStorageKey,
  TabGroupType,
  AreaName,
  tabGroupTypes,
  sessionStorageKeys,
  MessageType,
  stubPagePathName,
  protocolsEligibleForEncoding,
  LocalStorageKey,
  localStorageKeys,
  bookmarkerDetails,
  CurrentlyNavigatedTabId,
  newTabNavigatedTabId,
  navigationBoxPathName,
  AntecedentTabInfo,
} from "./constants";

export async function getStorageData<T = unknown>(
  key: SessionStorageKey | LocalStorageKey
) {
  const areaName = key.split("-")[0] as AreaName;

  return (await chrome.storage[areaName].get(key))[key] as T | undefined;
}

export async function setStorageData<T = unknown>(
  key: SessionStorageKey | LocalStorageKey,
  value: T
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].set({ [key]: value });
}

export async function removeStorageData(
  key: SessionStorageKey | LocalStorageKey
) {
  const areaName = key.split("-")[0] as AreaName;
  chrome.storage[areaName].remove(key);
}

export async function subscribeToStorageData<T = unknown>(
  key: SessionStorageKey | LocalStorageKey,
  fn: (changes: { newValue: T | undefined; oldValue: T | undefined }) => void
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

export async function sendMessage(
  message: { type: MessageType; data?: any },
  fn?: (response: any) => void
) {
  chrome.runtime.sendMessage(
    {
      type: message.type,
      data: message.data,
    },
    // @ts-ignore. looks like `chrome.runtime.sendMessage` was typed incorrectly
    fn
  );
}

export function subscribeToMessage(
  messageType: MessageType,
  fn: (
    data: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) => void
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
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"]
) {
  const tabGroupTreeData =
    (await getStorageData<TabGroupTreeData>(
      sessionStorageKeys.tabGroupTreeData
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
      options.title ?? ""
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
  timeout: number
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
  bookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"]
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
  masterBookmarkNodeId: chrome.bookmarks.BookmarkTreeNode["id"]
) {
  // @maybe the error shouldn't be handled here
  try {
    for (const bookmarkNode of bookmarkNodes) {
      if (bookmarkNode.id !== masterBookmarkNodeId) {
        const bookmarkNodeChildren = await chrome.bookmarks.getChildren(
          bookmarkNode.id
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
  promise: Promise<T>
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
  }
>(
  options: T
): Promise<
  T["newWindow"] extends true
    ? chrome.windows.Window | undefined
    : chrome.tabs.Tab | undefined
> {
  const [error] = await withError(
    setStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo, {
      precedentTabId: options.precedentTabId,
    })
  );
  if (error) {
    // @handle
  }
  await setStorageData<CurrentlyNavigatedTabId>(
    sessionStorageKeys.currentlyNavigatedTabId,
    options?.navigatedTabId ?? newTabNavigatedTabId
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
