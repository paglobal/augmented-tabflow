import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
  importTabGroupFromSession,
  sessionsTreeData,
} from "./sessionService";
import { tabGroupColorList, titles } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";

export async function importTabGroupFromSessionTreeContent() {
  // @handled
  try {
    const _currentSessionData = currentSessionData();
    const _sessionsTreeData = sessionsTreeData().filter((sessionData) =>
      _currentSessionData !== currentSessionDataNotAvailable
        ? sessionData.id !== _currentSessionData?.id
        : true,
    );
    const importTabGroupFromSessionTreeContent = _sessionsTreeData.map(
      async (sessionData) => {
        let sessionDataChildren = await chrome.bookmarks.getChildren(
          sessionData.id,
        );
        sessionDataChildren = sessionDataChildren.filter((tabGroupData) => {
          const ungrouped = tabGroupData.title === titles.ungroupedTabGroup;
          if (tabGroupData.url) {
            return false;
          }
          if (ungrouped) {
            return false;
          }

          return true;
        });
        sessionDataChildren.push({
          title: titles.ungroupedTabGroup,
          id: titles.ungroupedTabGroup,
          parentId: sessionData.id,
        });

        return (
          <TreeItem tooltipContent={sessionData.title}>
            {html`${h(TreeItemColorPatchOrIcon, {
              icon: "window",
            })}${sessionData.title}
            ${sessionDataChildren.map((tabGroupData) => {
              const ungrouped = tabGroupData.title === titles.ungroupedTabGroup;
              const tabGroupDataTitleSegments = tabGroupData.title.split("-");
              const tabGroupColor =
                tabGroupDataTitleSegments[0] as chrome.tabGroups.Color;
              const tabGroupTitle = tabGroupDataTitleSegments
                .slice(1)
                .join("-");
              if (!tabGroupColorList.includes(tabGroupColor) && !ungrouped) {
                return null;
              }

              return (
                <TreeItem
                  tooltipContent={
                    tabGroupData.title === titles.ungroupedTabGroup
                      ? titles.ungroupedTabGroup
                      : tabGroupTitle
                  }
                  onSelect={async (e: Event) => {
                    // @handled
                    try {
                      e.stopPropagation();
                      await importTabGroupFromSession(tabGroupData);
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                  actionButtons={html`
                    <sl-icon-button
                      name="copy"
                      title="Copy Instead of Move"
                      @click=${async (e: Event) => {
                        // @handled
                        try {
                          e.stopPropagation();
                          await importTabGroupFromSession(tabGroupData, true);
                        } catch (error) {
                          console.error(error);
                          notifyWithErrorMessageAndReloadButton();
                        }
                      }}
                    ></sl-icon-button>
                  `}
                >
                  {html`${h(TreeItemColorPatchOrIcon, {
                    color:
                      tabGroupData.title === titles.ungroupedTabGroup
                        ? undefined
                        : tabGroupColor,
                    icon:
                      tabGroupData.title === titles.ungroupedTabGroup
                        ? "MaterialSymbolsFolderOpenOutlineRounded"
                        : undefined,
                  })}${tabGroupData.title === titles.ungroupedTabGroup
                    ? titles.ungroupedTabGroup
                    : tabGroupTitle}`}
                </TreeItem>
              );
            })}`}
          </TreeItem>
        );
      },
    );

    return await Promise.all(importTabGroupFromSessionTreeContent);
  } catch (error) {
    console.error(error);

    return fallbackTreeContent();
  }
}
