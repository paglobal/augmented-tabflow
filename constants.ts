// TO ADD A NEW STORAGE KEY:
// create a new entry in the appropriate storage key object with the appropriate key and value (please follow chronological order!)
// TO REMOVE OLD STORAGE KEY:
// comment it out and add functionality to delete that key on install/update
// TO RESTORE OLD STORAGE KEY:
// uncomment it and add remove functionality that deletes that key on install/update
export type AreaName = "sync" | "session";

export type SessionStorageKey = `session-${number}`;

export const sessionStorageKeys = {
  tabGroupTreeData: "session-1",
  currentSessionData: "session-2",
  debounceTabGroupTreeDataUpdates: "session-3",
  tabGroupTreeDataUpdateTimeoutId: "session-4",
  ungroupedTabGroupCollapsed: "session-5",
  // not a typo!
  recentlyClosedTabGroupGroupCollapsed: "session-6",
  tabs_discardOnUpdate: "session-7",
  tabs_discard: "session-8",
  tabs_skipSessionDataUpdate: "session-9",
  tabGroups_skipSessionDataUpdate: "session-10",
  previousUnsavedSessionTabGroupTreeData: "session-11",
} as const satisfies Record<string, SessionStorageKey>;

export type SyncStorageKey = `sync-${number}`;

export const syncStorageKeys = {
  rootBookmarkNodeId: "sync-1",
} as const satisfies Record<string, SyncStorageKey>;

export type TabGroupType = `tabGroupType-${number}`;

export const tabGroupTypes = {
  normal: "tabGroupType-1",
  ungrouped: "tabGroupType-2",
} as const satisfies Record<string, TabGroupType>;

export const rootBookmarkNodeTitle = "Augmented Tabflow Sessions";

export const newTabUrls = ["chrome://newtab/", "chrome://new-tab-page/"];

export const ungroupedTabGroupTitle = "Ungrouped";

export const unsavedSessionTitle = "Unsaved Session";
