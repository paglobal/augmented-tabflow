import { html } from "lit";
import { h } from "promethium-js";
import { TreeItem } from "./TreeItem";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import {
  currentSessionData,
  deleteSession,
  openNewSession,
  sessionsTreeData,
} from "./sessionService";
import {
  editSessionDialogRef,
  editSessionInputRef,
  helpDialogRef,
  saveCurrentSessionDialogRef,
  setCurrentlyEditedSessionId,
} from "./App";

export async function sessionsTreeContent() {
  // @fallback
  const _currentSessionData = await currentSessionData();
  const _sessionsTreeData = await sessionsTreeData();
  if (_currentSessionData) {
    if (_currentSessionData.index) {
      _sessionsTreeData.splice(_currentSessionData.index, 1);
    }
  }
  const sessionsTreeContent = _sessionsTreeData.map((sessionData) => {
    return html`
      ${h(TreeItem, {
        tooltipContent: sessionData.title,
        async onSelect(e: Event) {
          // @error
          e.stopPropagation();
          await openNewSession(sessionData);
        },
        actionButtons: html`
          <sl-icon-button
            name="pen"
            title="Edit Session Title"
            @click=${async (e: Event) => {
              // @error
              e.stopPropagation();
              if (editSessionInputRef.value) {
                setCurrentlyEditedSessionId(sessionData.id);
                editSessionDialogRef.value?.show();
                setTimeout(() => {
                  if (editSessionInputRef.value) {
                    editSessionInputRef.value.value = sessionData.title;
                  }
                });
              }
            }}
          ></sl-icon-button>
          <sl-icon-button
            name="trash"
            title="Delete Session"
            @click=${async (e: Event) => {
              // @error
              e.stopPropagation();
              deleteSession(sessionData.id);
            }}
          ></sl-icon-button>
        `,
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window",
        })}${sessionData.title}`,
      })}
    `;
  });
  if (_currentSessionData) {
    sessionsTreeContent.unshift(
      html`${h(TreeItem, {
        content: html`${h(TreeItemColorPatchOrIcon, {
          icon: "window-x",
        })}
        Exit Current Session`,
        tooltipContent: "Exit Current Session",
        async onSelect(e: Event) {
          // @error
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
        // @error
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
        // @error
        e.stopPropagation();
        saveCurrentSessionDialogRef.value?.show();
      },
    })}`,
  );

  return sessionsTreeContent;
}
