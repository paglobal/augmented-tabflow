import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { moveOrCopyToSession, sessionsTreeData } from "./sessionService";
import { getStorageData } from "../sharedUtils";
import { sessionStorageKeys, ungroupedTabGroupTitle } from "../constants";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { fallbackTreeContent } from "./fallbackTreeContent";

export async function moveOrCopyToSessionTreeContent(type: "tab" | "tabGroup") {
  // @handled
  try {
    const currentSessionData =
      await getStorageData<chrome.bookmarks.BookmarkTreeNode | null>(
        sessionStorageKeys.currentSessionData,
      );
    const _sessionsTreeData = (await sessionsTreeData()).filter(
      (sessionData) => sessionData.id !== currentSessionData?.id,
    );
    if (type === "tab") {
      const sessionsTreeContent = _sessionsTreeData.map(async (sessionData) => {
        const sessionDataChildren = await chrome.bookmarks.getChildren(
          sessionData.id,
        );

        if (!sessionDataChildren.length) {
          return null;
        }

        return html`
          ${h(TreeItem, {
            tooltipContent: sessionData.title,
            content: html`${h(TreeItemColorPatchOrIcon, {
              icon: "window",
            })}${sessionData.title}
            ${sessionDataChildren.map((tabGroupData) => {
              const tabGroupDataTitleSegments = tabGroupData.title.split("-");
              const tabGroupColor =
                tabGroupDataTitleSegments[0] as chrome.tabGroups.Color;
              const tabGroupTitle = tabGroupDataTitleSegments
                .slice(1)
                .join("-");

              return html`${h(TreeItem, {
                tooltipContent:
                  tabGroupData.title === ungroupedTabGroupTitle
                    ? ungroupedTabGroupTitle
                    : tabGroupTitle,
                async onSelect(e: Event) {
                  // @handled
                  try {
                    e.stopPropagation();
                    await moveOrCopyToSession(tabGroupData.id);
                  } catch (error) {
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
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                  ></sl-icon-button>
                `,
                content: html`${h(TreeItemColorPatchOrIcon, {
                  color:
                    tabGroupData.title === ungroupedTabGroupTitle
                      ? undefined
                      : tabGroupColor,
                  icon:
                    tabGroupData.title === ungroupedTabGroupTitle
                      ? "folder2-open"
                      : undefined,
                })}${tabGroupData.title === ungroupedTabGroupTitle
                  ? ungroupedTabGroupTitle
                  : tabGroupTitle}`,
              })}`;
            })}`,
          })}
        `;
      });

      return await Promise.all(sessionsTreeContent);
    } else {
      const sessionsTreeContent = _sessionsTreeData.map((sessionData) => {
        return html`
          ${h(TreeItem, {
            tooltipContent: sessionData.title,
            async onSelect(e: Event) {
              // @handled
              try {
                e.stopPropagation();
                await moveOrCopyToSession(sessionData.id);
              } catch (error) {
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
                    notifyWithErrorMessageAndReloadButton();
                  }
                }}
              ></sl-icon-button>
            `,
            content: html`${h(TreeItemColorPatchOrIcon, {
              icon: "window",
            })}${sessionData.title}`,
          })}
        `;
      });

      return sessionsTreeContent;
    }
  } catch (error) {
    notifyWithErrorMessageAndReloadButton();

    return fallbackTreeContent(true);
  }
}
