import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import {
  NavigateDialog,
  navigateInputRef,
  setCurrentlyNavigatedTabId,
} from "./src/NavigateDialog";
import "./customElements";
import {
  localStorageKeys,
  navigationBoxDimensions,
  sessionStorageKeys,
} from "./constants";
import { getStorageData, setStorageData } from "./sharedUtils";
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
                  onHide={async () => {
                    const window = await chrome.windows.getCurrent();
                    if (window.id) {
                      await chrome.windows.remove(window.id);
                    }
                  }}
                  open={true}
                  preventClosing={true}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>`;
}

async function centerWindow() {
  const window = await chrome.windows.getCurrent();
  const centeredLeft = Math.round(
    (screen.width - (window.width ?? navigationBoxDimensions.width)) / 2,
  );
  const centeredTop = Math.round(
    (screen.height - (window.height ?? navigationBoxDimensions.height)) / 2,
  );
  if (window.id) {
    chrome.windows.update(window.id, {
      left: centeredLeft,
      top: centeredTop,
    });
  }
  await setStorageData<number>(localStorageKeys.screenWidth, screen.width);
  await setStorageData<number>(localStorageKeys.screenHeight, screen.height);
}

initApp(App, async () => {
  // @error
  await centerWindow();
  const _window = await chrome.windows.getCurrent();
  window.addEventListener("blur", async () => {
    if (_window.id) {
      await chrome.windows.remove(_window.id);
    }
  });
  const _currentlyNavigatedTabId = await getStorageData<chrome.tabs.Tab["id"]>(
    sessionStorageKeys.currentlyNavigatedTabId,
  );
  if (!_currentlyNavigatedTabId) {
    if (_window.id) {
      chrome.windows.remove(_window.id);
    }

    return;
  }
  const currentlyNavigatedTab = await chrome.tabs.get(_currentlyNavigatedTabId);
  setCurrentlyNavigatedTabId(_currentlyNavigatedTabId);
  if (navigateInputRef.value) {
    navigateInputRef.value.value = currentlyNavigatedTab.url as string;
    setTimeout(() => {
      navigateInputRef.value?.select();
    });
  }
});
