import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  activateTab,
  addTabToTabGroup,
  closeTabGroup,
  collapseTabGroup,
  expandTabGroup,
  tabGroupTreeData,
} from "./sessionService";
import { editTabGroupDialogRefs, setCurrentlyEditedTabGroupId } from "./App";
import { newTabUrls, tabGroupTypes } from "../constants";

export async function tabGroupTreeContent() {
  // TODO: implement drag-and-drop for tabs and tab groups
  // TODO: implement "recently closed" tab groups feature
  // TODO: implement "copy to session / copy to tab group" feature
  return (await tabGroupTreeData()).map((tabGroup) => {
    return html`
      ${h(TreeItem, {
        tooltipContent: tabGroup.title as string,
        expanded: !tabGroup.collapsed,
        onExpand(e: Event) {
          e.stopPropagation();
          expandTabGroup(tabGroup);
        },
        onCollapse(e: Event) {
          e.stopPropagation();
          collapseTabGroup(tabGroup);
        },
        actionButtons: html`
          <sl-icon-button
            name="plus-lg"
            title="Add Tab"
            @click=${(e: Event) => {
              e.stopPropagation();
              addTabToTabGroup(tabGroup);
            }}
          ></sl-icon-button>
          ${tabGroup.type === tabGroupTypes.normal
            ? html`<sl-icon-button
                name="pen"
                title="Edit"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  setCurrentlyEditedTabGroupId(tabGroup.id);
                  editTabGroupDialogRefs.dialog.value?.show();
                  // use `setTimeout` to ensure that the cursor gets placed in the right position in the input
                  setTimeout(() => {
                    if (
                      editTabGroupDialogRefs.input.value &&
                      editTabGroupDialogRefs.select.value
                    ) {
                      editTabGroupDialogRefs.input.value.value =
                        tabGroup.title as string;
                      editTabGroupDialogRefs.select.value.value =
                        tabGroup.color;
                    }
                  });
                }}
              ></sl-icon-button>`
            : null}
          <sl-icon-button
            name="x-lg"
            title="Close"
            @click=${async (e: Event) => {
              e.stopPropagation();
              closeTabGroup(tabGroup);
            }}
          ></sl-icon-button>
        `,
        content: html`
          ${h(TreeItemColorPatchOrIcon, {
            color: tabGroup.color,
            icon: tabGroup.icon,
          })}
          ${tabGroup.title}
          ${tabGroup.tabs.map(
            (tab) => html`
              ${h(TreeItem, {
                tooltipContent: tab.title as string,
                selected: tab.active,
                onSelect(e: Event) {
                  e.stopPropagation();
                  activateTab(tab);
                },
                actionButtons: html`
                  <sl-icon-button
                    name="x-lg"
                    title="Close"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      chrome.tabs.remove(tab.id as number);
                    }}
                  ></sl-icon-button>
                `,
                content: html`
                  ${tab.mutedInfo?.muted
                    ? h(TreeItemColorPatchOrIcon, {
                        icon: "volume-mute",
                      })
                    : null}
                  ${tab.audible && !tab.mutedInfo?.muted
                    ? h(TreeItemColorPatchOrIcon, {
                        icon: "volume-down",
                      })
                    : null}
                  ${h(TreeItemColorPatchOrIcon, {
                    pageUrl: tab.url,
                    showSpinner:
                      tab.status === "loading" &&
                      !newTabUrls.includes(tab.url as string)
                        ? true
                        : false,
                  })}
                  ${tab.title}
                `,
              })}
            `,
          )}
        `,
      })}
    `;
  });
}
