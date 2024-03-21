import { html } from "lit";
import { h } from "promethium-js";
import { until } from "lit/directives/until.js";
import { type Ref } from "lit/directives/ref.js";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import { Tree } from "./Tree";
import { TreeItem } from "./TreeItem";
import { TabGroupColorPatchOrTabIcon } from "./TabGroupColorPatchOrTabIcon";
import {
  activateTab,
  addTabToTabGroup,
  closeTabGroup,
  collapseTabGroup,
  expandTabGroup,
  tabGroupTreeData,
} from "./sessionService";
import { editTabGroupDialogRefs, setCurrentlyEditedTabGroupId } from "./App";

export function SessionView(props: { editTabGroupDialogRef: Ref<SlDialog> }) {
  const newTabUrls = ["chrome://newtab/", "chrome://new-tab-page/"];

  async function tabGroupTree() {
    // TODO: handle possible error with fallback content and functional alert
    // TODO: indicate if audio is playing in tab
    // TODO: implement drag-and-drop for tabs and tab groups
    // TODO: implement recently closed tab groups feature
    return (await tabGroupTreeData()).map((tabGroup) => {
      return html`
        ${h(TreeItem, {
          tooltipContent: tabGroup.title,
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
            <sl-icon-button
              name="pen"
              title="Edit"
              @click=${(e: Event) => {
                e.stopPropagation();
                setCurrentlyEditedTabGroupId(tabGroup.id);
                if (
                  editTabGroupDialogRefs.input.value &&
                  editTabGroupDialogRefs.select.value
                ) {
                  editTabGroupDialogRefs.input.value.value = tabGroup.title;
                  editTabGroupDialogRefs.select.value.value = tabGroup.color;
                }
                props.editTabGroupDialogRef.value?.show();
              }}
            ></sl-icon-button>
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
            ${h(TabGroupColorPatchOrTabIcon, {
              color: tabGroup.color,
            })}
            ${tabGroup.title}
            ${tabGroup.tabs.map(
              (tab) => html`
                ${h(TreeItem, {
                  tooltipContent: tab.title,
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
                        chrome.tabs.remove(tab.id);
                      }}
                    ></sl-icon-button>
                  `,
                  content: html`
                    ${h(TabGroupColorPatchOrTabIcon, {
                      pageUrl: tab.url,
                      showSpinner:
                        tab.status === "loading" &&
                        !newTabUrls.includes(tab.url)
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

  function fallbackContent(errorOccurred?: boolean) {
    let message = "Loading...";
    if (errorOccurred) {
      message = "Error occurred while loading...";
    }

    return html`${h(TreeItem, {
      content: html`${message}`,
      tooltipContent: message,
    })}`;
  }

  return () => html`
    ${h(Tree, {
      contentFn: () => html`${until(tabGroupTree(), fallbackContent())}`,
    })}
  `;
}
