// TODO: implement migrations for storage using `onInstalled`
export type SessionStorageKey = `session-${number}`;

export const sessionStorageKeys: Record<string, SessionStorageKey> = {
  tabGroupTreeData: "session-1",
  currentSession: "session-2",
} as const;

export type SyncStorageKey = `sync-${number}`;

export const syncStorageKeys: Record<string, SyncStorageKey> = {
  rootBookmarkNodeId: "sync-1",
} as const;

export const areaNames = {
  sync: "sync",
  session: "session",
} as const;

export const rootBookmarkNodeTitle = "Augmented Tabflow Sessions";
