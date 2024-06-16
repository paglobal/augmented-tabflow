import { html } from "lit";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { getStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";

export function fallbackTreeContent() {
  const message = "Loading...";

  return (
    <TreeItem
      tooltipContent={message}
      actionButtons={html`
        <sl-icon-button
          name="arrow-clockwise"
          title="Attempt Recovery"
          @click=${async (e: Event) => {
            // @handled
            try {
              e.stopPropagation();
              try {
                const currentlyRemovedTabId = await getStorageData<
                  chrome.tabs.Tab["id"]
                >(sessionStorageKeys.currentlyRemovedTabId);
                if (currentlyRemovedTabId) {
                  await chrome.tabs.remove(currentlyRemovedTabId);
                }
              } finally {
                location.reload();
              }
            } catch (error) {
              console.error(error);
              notifyWithErrorMessageAndReloadButton();
            }
          }}
        ></sl-icon-button>
      `}
    >
      {html`${(
        <>
          <TreeItemColorPatchOrIcon showSpinner={true} />
          {message}
        </>
      )}`}
    </TreeItem>
  );
}
