import { repeat } from "lit/directives/repeat.js";
import { tabGroupTreeData } from "./sessionService";
import { TabGroupTreeItem } from "./TabGroupTreeItem";
import { html } from "lit";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";
import { styleMap } from "lit/directives/style-map.js";
import { PromethiumNode } from "promethium-js";

export async function sessionViewSessionWindowsTreeContent() {
  // @handled
  try {
    const currentWindowId = (await chrome.windows.getCurrent()).id;
    const sessionWindows = (
      await chrome.windows.getAll({ windowTypes: ["normal"] })
    ).filter((window) => window.id !== currentWindowId);

    const sessionWindowsTreeContent: PromethiumNode[] = await Promise.all(
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
                if (window.id) {
                  await chrome.windows.update(window.id, { focused: true });
                }
              } catch (error) {
                console.error(error);
                notifyWithErrorMessageAndReloadButton();
              }
            }}
            actionButtons={html`<sl-icon-button
              name="x-lg"
              title="Close"
              @click=${async (e: Event) => {
                // @handled
                try {
                  e.stopPropagation();
                  if (window.id) {
                    await chrome.windows.remove(window.id);
                  }
                } catch (error) {
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>`}
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

    if (sessionWindowsTreeContent.length) {
      sessionWindowsTreeContent.unshift(html`
        <sl-divider style=${styleMap({ margin: "0.5rem 0" })}></sl-divider>
      `);
    }

    return sessionWindowsTreeContent;
  } catch (error) {
    console.error(error);

    return fallbackTreeContent();
  }
}

export async function tabGroupTreeContent() {
  // @handled
  const _tabGroupTreeData = tabGroupTreeData();
  const _sessionViewSessionWindowsTreeContent =
    await sessionViewSessionWindowsTreeContent();
  const tabGroupTreeContent = html`
    ${repeat(
      _tabGroupTreeData,
      (tabGroup) => tabGroup.id,
      (tabGroup) => {
        return <TabGroupTreeItem tabGroup={tabGroup} />;
      },
    )}
    ${_sessionViewSessionWindowsTreeContent}
  `;

  return tabGroupTreeContent;
}
