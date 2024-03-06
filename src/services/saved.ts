import { adaptState } from "promethium-js";
import { syncStorageKeys } from "../constants";

export async function getRootBookmarkNodeTreeData() {
  const rootBookmarkNodeId = (
    await chrome.storage.sync.get(syncStorageKeys.rootBookmarkNodeId)
  )[syncStorageKeys.rootBookmarkNodeId];
  if (rootBookmarkNodeId === undefined) {
    // TODO: handle this error
    // return previous tree if this continues to error
    return rootBookmarkNodeTreeData();
  } else {
    return await chrome.bookmarks.getChildren(rootBookmarkNodeId);
  }
}

export const [rootBookmarkNodeTreeData, setRootBookmarkNodeTreeData] =
  adaptState<
    | Promise<chrome.bookmarks.BookmarkTreeNode[]>
    | chrome.bookmarks.BookmarkTreeNode[]
  >(getRootBookmarkNodeTreeData);

async function updateRootBookmarkNodeTreeData() {
  const rootBookmarkNodeTreeData = await getRootBookmarkNodeTreeData();
  setRootBookmarkNodeTreeData(rootBookmarkNodeTreeData);
}

chrome.bookmarks.onChanged.addListener(async () => {
  await updateRootBookmarkNodeTreeData();
  console.log("bookmark changed!");
});

chrome.bookmarks.onCreated.addListener(async () => {
  await updateRootBookmarkNodeTreeData();
  console.log("bookmark created!");
});

chrome.bookmarks.onRemoved.addListener(async () => {
  await updateRootBookmarkNodeTreeData();
  console.log("bookmark removed!");
});
