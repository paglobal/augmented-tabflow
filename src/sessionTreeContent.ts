import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { sessionTreeData } from "./sessionService";
import { helpDialogRef, saveCurrentSessionDialogRef } from "./App";

export async function sessionTreeContent() {
  const sessionTree = (await sessionTreeData()).map((session) => {
    return html`
      ${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window",
        })}${session.title}`,
        tooltipContent: session.title,
        onSelect(e: Event) {
          e.stopPropagation();
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
