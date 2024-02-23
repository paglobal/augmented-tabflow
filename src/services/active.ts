import { adaptState } from "promethium-js";

type TabGroupTreeData = (chrome.tabGroups.TabGroup & {
  tabs: chrome.tabs.Tab[];
})[];

export async function getTabGroupTreeData() {
  const tabGroups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });
  const tabs = await chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });

  const tabGroupTreeData = tabs.reduce<TabGroupTreeData>(
    (tabGroupTreeDataAccumulator, currentTab) => {
      const currentTabGroupIndex = tabGroupTreeDataAccumulator.findIndex(
        (tabGroupTreeDataAccumulatorEntry) =>
          tabGroupTreeDataAccumulatorEntry.id === currentTab.groupId,
      );
      if (currentTabGroupIndex !== -1) {
        tabGroupTreeDataAccumulator[currentTabGroupIndex].tabs.push(currentTab);
      } else {
        const currentTabGroup = tabGroups.find(
          (tabGroup) => tabGroup.id === currentTab.groupId,
        );
        if (currentTabGroup) {
          tabGroupTreeDataAccumulator.push({
            ...currentTabGroup,
            tabs: [currentTab],
          });
        }
      }

      return tabGroupTreeDataAccumulator;
    },
    [],
  );

  return tabGroupTreeData;
}

export const [tabGroupTreeData, setTabGroupTreeData] = adaptState<
  Promise<TabGroupTreeData> | TabGroupTreeData
>(getTabGroupTreeData);

export const [tabGroupTreeAlreadyUpdated, setTabGroupTreeAlreadyUpdated] =
  adaptState(false);

async function updateTabGroupTreeData() {
  const tabGroupTreeData = await getTabGroupTreeData();
  if (!tabGroupTreeAlreadyUpdated()) {
    setTabGroupTreeData(tabGroupTreeData);
  } else {
    setTabGroupTreeAlreadyUpdated(false);
  }
}

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
// TODO: optimize this using some sort of queue or something
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
