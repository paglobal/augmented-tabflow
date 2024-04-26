import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  currentSessionData,
  openNewSession,
  sessionsTreeData,
} from "./sessionService";
import { helpDialogRef, saveCurrentSessionDialogRef } from "./App";

export async function sessionsTreeContent() {
  const sessionsTreeContent = (await sessionsTreeData()).map((sessionData) => {
    return html`
      ${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window",
        })}${sessionData.title}`,
        tooltipContent: sessionData.title,
        async onSelect(e: Event) {
          e.stopPropagation();
          await openNewSession(sessionData);
        },
      })}
    `;
  });

  const _currentSessionData = await currentSessionData();

  if (_currentSessionData) {
    sessionsTreeContent.unshift(
      html`${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window-x",
        })}
        Exit Current Session`,
        tooltipContent: "Exit Current Session",
        async onSelect(e: Event) {
          e.stopPropagation();
          await openNewSession(null);
        },
      })}`,
    );
  }

  sessionsTreeContent?.unshift(
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

  return sessionsTreeContent;
}
