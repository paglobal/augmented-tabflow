import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { sessionTreeData } from "./sessionService";
import { helpDialogRef, saveCurrentSessionDialogRef } from "./App";
import { sessionToolbarSelectRef } from "./SessionToolbar";
import { setStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";

export async function sessionTreeContent() {
  const sessionTree = (await sessionTreeData()).map((sessionData) => {
    return html`
      ${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window",
        })}${sessionData.title}`,
        tooltipContent: sessionData.title,
        onSelect(e: Event) {
          e.stopPropagation();
          if (sessionToolbarSelectRef.value) {
            sessionToolbarSelectRef.value.value = sessionData.id;
            setStorageData(sessionStorageKeys.currentSessionId, sessionData.id);
          }
        },
      })}
    `;
  });

  sessionTree?.unshift(
    html`${h(TreeItem, {
      content: html`${h(TreeItemColorPatchOrIcon, {
        icon: "question-circle",
      })}
      Help`,
      tooltipContent: "Help",
      onSelect(e: Event) {
        e.stopPropagation();
        helpDialogRef.value?.show();
      },
    })}`,
    html`${h(TreeItem, {
      content: html`${h(TreeItemColorPatchOrIcon, {
        icon: "window-plus",
      })}
      Save Current Session`,
      tooltipContent: "Save Current Session",
      onSelect(e: Event) {
        e.stopPropagation();
        saveCurrentSessionDialogRef.value?.show();
      },
    })}`,
  );

  return sessionTree;
}
