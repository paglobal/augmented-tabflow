import { html } from "lit";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { currentlyEjectedTabOrTabGroup } from "./App";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { moveTabOrTabGroupToWindow } from "./sessionService";

export async function sessionWindowsTreeContent() {
  // @handled
  try {
    const _currentlyEjectedTabOrTabGroup = currentlyEjectedTabOrTabGroup();
    const sessionWindows = (
      await chrome.windows.getAll({ windowTypes: ["normal"] })
    ).filter(
      (window) => window.id !== _currentlyEjectedTabOrTabGroup?.windowId,
    );

    const sessionWindowsTreeContent = await Promise.all(
      sessionWindows.map(async (window) => {
        const activeTab = (
          await chrome.tabs.query({ windowId: window.id, active: true })
        )[0];

        return (
          <TreeItem
            tooltipContent={`${activeTab.title}`}
            onSelect={async (e: Event) => {
              // @handled
              try {
                e.stopPropagation();
                moveTabOrTabGroupToWindow(window.id);
              } catch (error) {
                console.error(error);
                notifyWithErrorMessageAndReloadButton();
              }
            }}
          >
            {html`${(
              <>
                <TreeItemColorPatchOrIcon pageUrl={activeTab.url} />
                {activeTab.title}
              </>
            )}`}
          </TreeItem>
        );
      }),
    );

    sessionWindowsTreeContent.unshift(
      <TreeItem
        tooltipContent="New Window"
        onSelect={(e: Event) => {
          // @handled
          try {
            e.stopPropagation();
            moveTabOrTabGroupToWindow();
          } catch (error) {
            console.error(error);
            notifyWithErrorMessageAndReloadButton();
          }
        }}
      >
        {html`${(
          <>
            <TreeItemColorPatchOrIcon icon="MaterialSymbolsTabOutlineRounded" />
            New Window
          </>
        )}`}
      </TreeItem>,
    );

    return sessionWindowsTreeContent;
  } catch (error) {
    console.error(error);

    return fallbackTreeContent();
  }
}
