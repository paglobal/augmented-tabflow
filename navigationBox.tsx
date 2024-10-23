import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import {
  NavigateDialog,
  navigateInputRef,
  setCurrentlyNavigatedTabId,
} from "./src/NavigateDialog";
import "./customElements";
import {
  CurrentlyNavigatedTabId,
  newTabNavigatedTabId,
  sessionStorageKeys,
} from "./constants";
import { getStorageData, wait } from "./sharedUtils";
import { initApp } from "./src/utils";

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
              <>
                <NavigateDialog
                  onHide={() => {
                    close();
                  }}
                  open={true}
                  onlyInput={true}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>`;
}

initApp(App, async () => {
  // @error
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) {
      close();
    }
  });
  window.addEventListener("blur", async () => {
    close();
  });
  const currentlyNavigatedTabId = await getStorageData<CurrentlyNavigatedTabId>(
    sessionStorageKeys.currentlyNavigatedTabId,
  );
  if (typeof currentlyNavigatedTabId === "number") {
    const currentlyNavigatedTab = await chrome.tabs.get(
      currentlyNavigatedTabId,
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
