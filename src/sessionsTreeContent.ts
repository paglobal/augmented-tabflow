import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { openNewSession, sessionsTreeData } from "./sessionService";
import { helpDialogRef, saveCurrentSessionDialogRef } from "./App";
import { setStorageData } from "../sharedUtils";
import { sessionStorageKeys } from "../constants";

export async function sessionsTreeContent() {
  const sessionTreeContent = (await sessionsTreeData()).map((sessionData) => {
    return html`
      ${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window",
        })}${sessionData.title}`,
        tooltipContent: sessionData.title,
        async onSelect(e: Event) {
          e.stopPropagation();
          await setStorageData(
            sessionStorageKeys.currentSessionId,
            sessionData.id,
          );
          await openNewSession(sessionData.id);
        },
      })}
    `;
  });

  sessionTreeContent?.unshift(
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
    html`${h(TreeItem, {
      content: html`${h(TreeItemColorPatchOrIcon, {
        icon: "window-x",
      })}
      Exit Current Session`,
      tooltipContent: "Exit Current Session",
      async onSelect(e: Event) {
        e.stopPropagation();
        await setStorageData(sessionStorageKeys.currentSessionId, "");
        await openNewSession();
      },
    })}`,
  );

  return sessionTreeContent;
}
