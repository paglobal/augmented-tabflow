export type AreaName = "sync" | "session";

export type SessionStorageKey = `session-${number}`;

export type SessionData = chrome.bookmarks.BookmarkTreeNode | null;
export const sessionStorageKeys = {
  tabGroupTreeData: "session-1",
  currentSessionData: "session-2",
  debounceTabGroupTreeDataUpdates: "session-3",
  tabGroupTreeDataUpdateTimeoutId: "session-4",
  ungroupedTabGroupCollapsed: "session-5",
  previousUnsavedSessionTabGroupTreeData: "session-6",
  recentlyClosedTabGroups: "session-7",
  readyToUpdateCurrentSessionData: "session-8",
  pinnedTabGroupCollapsed: "session-9",
  sessionLoading: "session-10",
  currentlyRemovedTabId: "session-11",
  stubTabId: "session-12",
  removingOldSessionTabs: "session-13",
  startup: "session-14",
} as const satisfies Record<string, SessionStorageKey>;

export type SyncStorageKey = `sync-${number}`;

export const syncStorageKeys = {
  rootBookmarkNodeId: "sync-1",
  pinnedTabGroupBookmarkNodeId: "sync-2",
} as const satisfies Record<string, SyncStorageKey>;

export type TabGroupType = `tabGroup-${number}`;

export const tabGroupTypes = {
  normal: "tabGroup-1",
  ungrouped: "tabGroup-2",
  pinned: "tabGroup-3",
} as const satisfies Record<string, TabGroupType>;

type LockName = `lock-${number}`;

export const lockNames = {
  applyUpdates: "lock-1",
  createBookmarkNode: "lock-2",
  removingOldSessionTabs: "lock-3",
} as const satisfies Record<string, LockName>;

export const titles = {
  rootBookmarkNode: "Augmented Tabflow Sessions",
  pinnedTabGroup: "Pinned",
  ungroupedTabGroup: "Ungrouped",
  unsavedSession: "Unsaved Session",
};

export const newTabUrls = ["chrome://newtab/", "chrome://new-tab-page/"];

export const tabGroupColorList = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange",
];

export type MessageType = `message-${number}`;

export const messageTypes = {
  openNewSession: "message-1",
  restoreTab: "message-2",
  moveTabOrTabGroupToWindow: "message-3",
  closeAllSessionWindows: "message-4",
  updateTabGroupTreeDataAndCurrentSessionData: "message-5",
} as const satisfies Record<string, MessageType>;

export const tabGroupTreeDataUpdateDebounceTimeout = 200;
