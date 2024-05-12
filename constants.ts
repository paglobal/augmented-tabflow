export type AreaName = "sync" | "session";

export type SessionStorageKey = `session-${number}`;

export type SessionData = chrome.bookmarks.BookmarkTreeNode | null;
export const sessionStorageKeys = {
  tabGroupTreeData: "session-1",
  currentSessionData: "session-2",
  debounceTabGroupTreeDataUpdates: "session-3",
  tabGroupTreeDataUpdateTimeoutId: "session-4",
  ungroupedTabGroupCollapsed: "session-5",
  previousUnsavedSessionTabGroupTreeData: "session-7",
  recentlyClosedTabGroups: "session-8",
  recentlyClosedTabGroupsCollapsed: "session-9",
  readyToUpdateCurrentSessionData: "session-10",
  pinnedTabGroupCollapsed: "session-11",
  sessionLoading: "session-12",
  currentlyRemovedTabId: "session-13",
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
} as const satisfies Record<string, MessageType>;

export const tabGroupTreeDataUpdateDebounceTimeout = 200;
