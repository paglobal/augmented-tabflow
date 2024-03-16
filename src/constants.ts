// TODO: implement migrations for storage using `onInstalled`
export const localStorageKeys = {
  tabGroupTreeData: "1",
} as const;

export const sessionStorageKeys = {
  currentSession: "1",
} as const;

export const syncStorageKeys = {
  rootBookmarkNodeId: "1",
  lastSession: "2",
} as const;

export const areaNames = {
  local: "local",
  sync: "sync",
  session: "session",
} as const;

export const rootBookmarkNodeTitle = "Augmented Tabflow Sessions";
