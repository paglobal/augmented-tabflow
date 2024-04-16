// TODO: implement migrations for storage using `onInstalled`
export type SessionStorageKey = `session-${number}`;

export const sessionStorageKeys = {
  tabGroupTreeData: "session-1",
  currentSession: "session-2",
  debounceTabGroupTreeDataUpdates: "session-3",
  tabGroupTreeDataUpdateTimeoutId: "session-4",
  ungroupedTabGroupCollapsed: "session-5",
} as const satisfies Record<string, SessionStorageKey>;

export type SyncStorageKey = `sync-${number}`;

export const syncStorageKeys = {
  rootBookmarkNodeId: "sync-1",
} as const satisfies Record<string, SyncStorageKey>;

export const areaNames = {
  sync: "sync",
  session: "session",
} as const;

export type TabGroupType = `tabGroupType-${number}`;

export const tabGroupTypes = {
  normal: "tabGroupType-1",
  ungrouped: "tabGroupType-2",
} as const satisfies Record<string, TabGroupType>;

export type MessageType = `messageType-${number}`;

export const messageTypes = {
  updateTabGroupTreeData: "messageType-1",
} as const satisfies Record<string, MessageType>;

export const rootBookmarkNodeTitle = "Augmented Tabflow Sessions";
