import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
  importTabGroupFromSession,
  moveOrCopyToSession,
  sessionsTreeData,
} from "./sessionService";
import { titles } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";

export async function importTabGroupFromSessionTreeContent() {
  // @handled
  try {
    const _currentSessionData = currentSessionData();
    const _sessionsTreeData = sessionsTreeData().filter((sessionData) =>
      _currentSessionData !== currentSessionDataNotAvailable
        ? sessionData.id !== _currentSessionData?.id
        : true
    );
    const importTabGroupFromSessionTreeContent = _sessionsTreeData.map(
      async (sessionData) => {
        const sessionDataChildren = await chrome.bookmarks.getChildren(
          sessionData.id
        );
        if (!sessionDataChildren.length) {
          return null;
        }
        return h(TreeItem, {
          tooltipContent: sessionData.title,
          content: html`${h(TreeItemColorPatchOrIcon, {
            icon: "window",
          })}${sessionData.title}
          ${sessionDataChildren.map((tabGroupData) => {
            const tabGroupDataTitleSegments = tabGroupData.title.split("-");
            const tabGroupColor =
              tabGroupDataTitleSegments[0] as chrome.tabGroups.Color;
            const tabGroupTitle = tabGroupDataTitleSegments.slice(1).join("-");

            return h(TreeItem, {
              tooltipContent:
                tabGroupData.title === titles.ungroupedTabGroup
                  ? titles.ungroupedTabGroup
                  : tabGroupTitle,
              async onSelect(e: Event) {
                // @handled
                try {
                  e.stopPropagation();
                  await importTabGroupFromSession(tabGroupData);
                } catch (error) {
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              },
              actionButtons: html`
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
              `,
              content: html`${h(TreeItemColorPatchOrIcon, {
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
                : tabGroupTitle}`,
            });
          })}`,
        });
      }
    );

    return await Promise.all(importTabGroupFromSessionTreeContent);
  } catch (error) {
    console.error(error);

    return fallbackTreeContent();
  }
}
