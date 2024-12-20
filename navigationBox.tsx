import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import {
  NavigateDialog,
  navigateInputRef,
  setCurrentlyNavigatedTabId,
} from "./src/NavigateDialog";
import "./customElements";
import {
  AntecedentTabInfo,
  CurrentlyNavigatedTabId,
  newTabNavigatedTabId,
  sessionStorageKeys,
} from "./constants";
import { getStorageData, setStorageData, wait, withError } from "./sharedUtils";
import { initApp } from "./src/utils";
import { currentTabGroupSpaceColor } from "./src/sessionService";
import { adaptSyncEffect } from "promethium-js";

function App() {
  return () =>
    html`<div
      id="app"
      style=${styleMap({
        height: "100vh",
        overflow: "hidden",
      })}
    >
      <div
        style=${styleMap({
          width: "min(800px, 90%)",
          margin: "auto",
        })}
      >
        <div
          style=${styleMap({
            fontSize: "--sl-font-size-small",
            width: "100%",
          })}
        >
          <div
            style=${styleMap({
              display: "flex",
              flexDirection: "column",
              paddingBottom: "1.5rem",
            })}
          >
            ${(
              <NavigateDialog
                onHide={() => {
                  close();
                }}
                open={true}
                onlyInput={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>`;
}

initApp(App, async () => {
  // @error
  const [error, currentTab] = await withError(chrome.tabs.getCurrent());
  if (error) {
    // @handle
  }
  const [_error, antecedentTabInfo] = await withError(
    getStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo)
  );
  if (_error) {
    // @handle
  }
  const [__error] = await withError(
    setStorageData<AntecedentTabInfo>(sessionStorageKeys.antecedentTabInfo, {
      id: currentTab?.id,
      precedentTabId: antecedentTabInfo?.precedentTabId,
    })
  );
  if (__error) {
    // @handle
  }
  if (currentTab?.id) {
    const params = new URLSearchParams(document.location.search);
    const group = params.get("group");
    if (group) {
      const tabGroupId = await chrome.tabs.group({
        tabIds: currentTab.id,
        createProperties: {
          windowId: currentTab.windowId,
        },
      });
      await chrome.tabGroups.move(tabGroupId, { index: -1 });
      adaptSyncEffect(() => {
        const _currentTabGroupSpaceColor = currentTabGroupSpaceColor();
        if (
          _currentTabGroupSpaceColor &&
          _currentTabGroupSpaceColor !== "sky"
        ) {
          chrome.tabGroups.update(tabGroupId, {
            color: _currentTabGroupSpaceColor,
          });
        }
      });
    }
  }
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) {
      close();
    }
  });
  const currentlyNavigatedTabId = await getStorageData<CurrentlyNavigatedTabId>(
    sessionStorageKeys.currentlyNavigatedTabId
  );
  if (typeof currentlyNavigatedTabId === "number") {
    const currentlyNavigatedTab = await chrome.tabs.get(
      currentlyNavigatedTabId
    );
    setCurrentlyNavigatedTabId(currentlyNavigatedTabId);
    if (navigateInputRef.value) {
      navigateInputRef.value.value = currentlyNavigatedTab.url as string;
      await wait();
      navigateInputRef.value?.select();
    }
  } else {
    setCurrentlyNavigatedTabId(newTabNavigatedTabId);
  }
});
