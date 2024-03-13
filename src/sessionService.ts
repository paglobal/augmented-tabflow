import { adaptState } from "promethium-js";

export type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  tabs: chrome.tabs.Tab[];
})[];

async function getTabGroupTreeData() {
  const tabGroups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });
  const tabs = await chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });

  const tabGroupTreeData = tabs.reduce<TabGroupTreeData>(
    (tabGroupTreeData, currentTab) => {
      const currentTabGroupIndex = tabGroupTreeData.findIndex(
        (tabGroup) => tabGroup.id === currentTab.groupId,
      );
      if (currentTabGroupIndex !== -1) {
        tabGroupTreeData[currentTabGroupIndex].tabs.push(currentTab);
      } else {
        const currentTabGroup = tabGroups.find(
          (tabGroup) => tabGroup.id === currentTab.groupId,
        );
        if (currentTabGroup) {
          tabGroupTreeData.push({
            ...currentTabGroup,
            tabs: [currentTab],
          });
        }
      }

      return tabGroupTreeData;
    },
    [],
  );

  return tabGroupTreeData;
}

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(getTabGroupTreeData);

async function updateTabGroupTreeData() {
  const tabGroupTreeData = await getTabGroupTreeData();
  setTabGroupTreeData(tabGroupTreeData);
}

// TODO: optimize event listeners to only account for current window
chrome.tabGroups.onCreated.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab group created!");
});

chrome.tabGroups.onRemoved.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab group removed!");
});

chrome.tabGroups.onUpdated.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab group updated!");
});

chrome.tabs.onActivated.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab activated!");
});

chrome.tabs.onAttached.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab attached!");
});

chrome.tabs.onCreated.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab created!");
});

chrome.tabs.onDetached.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab detached!");
});

// `chrome.tabGroups.onMoved` for tab groups is not necessary because of this. do not add it, it drastically reduces performance!
// TODO: optimize this using some sort of queue or debouncing or something
chrome.tabs.onMoved.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab moved!");
});

chrome.tabs.onRemoved.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab removed!");
});

chrome.tabs.onReplaced.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab replaced!");
});

chrome.tabs.onUpdated.addListener(async () => {
  await updateTabGroupTreeData();
  console.log("tab updated!");
});
