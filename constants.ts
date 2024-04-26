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
  readyToClosePreviousSession: "session-10",
  readyToUpdateCurrentSessionData: "session-11",
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

export const initialTabUrlBeginning = "data:text/html,<title>";

export const initialTabUrlSeparatingStub =
  "Augmented Tabflow Sessions Tab Stub Title. Use Side Panel UI For A Better View. All This Is Just An Initial Tab URL Separating Stub.";

export const tabGroupTreeDataUpdateDebounceTimeout = 200;
