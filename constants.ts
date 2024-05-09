export type AreaName = "sync" | "session";

export type SessionStorageKey = `session-${number}`;

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
} as const satisfies Record<string, SessionStorageKey>;

export type SyncStorageKey = `sync-${number}`;

export const syncStorageKeys = {
  rootBookmarkNodeId: "sync-1",
} as const satisfies Record<string, SyncStorageKey>;

export type TabGroupType = `tabGroup-${number}`;

export const tabGroupTypes = {
  normal: "tabGroup-1",
  ungrouped: "tabGroup-2",
} as const satisfies Record<string, TabGroupType>;

type LockName = `lock-${number}`;

export const lockNames = {
  applyUpdates: "lock-1",
  createRootBookmarkNode: "lock-2",
} as const satisfies Record<string, LockName>;

export const rootBookmarkNodeTitle = "Augmented Tabflow Sessions";

export const newTabUrls = ["chrome://newtab/", "chrome://new-tab-page/"];

export const ungroupedTabGroupTitle = "Ungrouped";

export const unsavedSessionTitle = "Unsaved Session";

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
  initSessionTabs: "message-1",
} as const satisfies Record<string, MessageType>;

export const tabGroupTreeDataUpdateDebounceTimeout = 200;
