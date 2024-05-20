import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
  moveOrCopyToSession,
  sessionsTreeData,
} from "./sessionService";
import { titles } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";

export async function moveOrCopyToSessionTreeContent(type: "tab" | "tabGroup") {
  // @handled
  try {
    const _currentSessionData = currentSessionData();
    const _sessionsTreeData = sessionsTreeData().filter((sessionData) =>
      _currentSessionData !== currentSessionDataNotAvailable
        ? sessionData.id !== _currentSessionData?.id
        : true,
    );
    if (type === "tab") {
      const sessionsTreeContent = _sessionsTreeData.map(async (sessionData) => {
        const sessionDataChildren = await chrome.bookmarks.getChildren(
          sessionData.id,
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

            return html`${h(TreeItem, {
              tooltipContent:
                tabGroupData.title === titles.ungroupedTabGroup
                  ? titles.ungroupedTabGroup
                  : tabGroupTitle,
              async onSelect(e: Event) {
                // @handled
                try {
                  e.stopPropagation();
                  await moveOrCopyToSession(tabGroupData.id);
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
                      await moveOrCopyToSession(tabGroupData.id, true);
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
            })}`;
          })}`,
        });
      });

      return await Promise.all(sessionsTreeContent);
    } else {
      const sessionsTreeContent = _sessionsTreeData.map((sessionData) => {
        return h(TreeItem, {
          tooltipContent: sessionData.title,
          async onSelect(e: Event) {
            // @handled
            try {
              e.stopPropagation();
              await moveOrCopyToSession(sessionData.id);
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
                  await moveOrCopyToSession(sessionData.id, true);
                } catch (error) {
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>
          `,
          content: html`${h(TreeItemColorPatchOrIcon, {
            icon: "window",
          })}${sessionData.title}`,
        });
      });

      return sessionsTreeContent;
    }
  } catch (error) {
    console.error(error);

    return fallbackTreeContent();
  }
}
