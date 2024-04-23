import { sessionStorageKeys } from "./constants";
import {
  closePreviousSession,
  createRootBookmarkNode,
  subscribeToStorageData,
  updateTabGroupTreeData,
} from "./sharedUtils";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  createRootBookmarkNode();
  updateTabGroupTreeData();
});

chrome.runtime.onStartup.addListener(() => {
  createRootBookmarkNode();
  updateTabGroupTreeData();
});

updateTabGroupTreeData();

chrome.tabGroups.onCreated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabGroups.onRemoved.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabGroups.onUpdated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onActivated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onAttached.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onCreated.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onDetached.addListener(() => {
  updateTabGroupTreeData();
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
chrome.tabs.onMoved.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onRemoved.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onReplaced.addListener(() => {
  updateTabGroupTreeData();
});

chrome.tabs.onUpdated.addListener(() => {
  updateTabGroupTreeData();
});
