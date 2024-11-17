import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./customElements";
import {
  infoHeader,
  initApp,
  infoList,
  infoListStyles,
  infoButton,
} from "./src/utils";
import { Dialog } from "./src/Dialog";
import { createRef } from "lit/directives/ref.js";
import { SlDialog } from "@shoelace-style/shoelace";
import {
  changeSidePanelPositionPage,
  donationsPage,
  homePage,
  keyboardShortcutsPage,
  recentUpdateListPage,
  titles,
} from "./constants";

function Help() {
  return () => html`
    ${infoListStyles()} ${infoHeader("Help", true)}
    ${infoButton("Change Side Panel Position", async () => {
      await chrome.tabs.create({ url: changeSidePanelPositionPage });
    })}
    ${infoButton("Recent Updates", async () => {
      await chrome.tabs.create({ url: recentUpdateListPage });
    })}
    ${infoButton("Donate", async () => {
      await chrome.tabs.create({ url: donationsPage });
    })}
    ${infoButton("Homepage", async () => {
      await chrome.tabs.create({ url: homePage });
    })}
    ${infoHeader("Recommended keyboard shortcuts")} ${infoList(`
- Open sesssion manager - Alt+A
- Toggle between side panel and popup as default extension action - Alt+T
- Close all session windows - Ctrl+Shift+W
- Exit current session - Ctrl+Shift+Q
- Open new tab - Ctrl+T
- Open new window - Ctrl+N
- Edit current tab URL - Ctrl+L
- Open new tab group - Ctrl+G
`)} ${infoButton("Edit Keyboard Shortcuts", async () => {
      await chrome.tabs.create({ url: keyboardShortcutsPage });
    })}
    ${infoHeader("General information and tips")} ${infoList(`
- This extension allows you to save your sessions as bookmarks that are automatically
  updated anytime you make a change to your current active saved session.
- You can use the side panel or the action popup for interacting with tabs, tab groups and sessions.
- Go full screen at any point in time to hide horizontal tabs. Full screen state is preserved for restoration and subsequent application to new windows.
- If you're experiencing problems editing tab groups, you might want to update
  to the latest version of Chrome.
- Sessions normally consist of all tabs from all "normal" windows (no
  popups, PWAs, etc).
- Because this extension enables you to restore sessions easily, you can
  turn of session restoration in Chrome if you have it enabled.
- In rare cases where session switching takes too long (eg. if you
  interrupt the process unintentionally), the extension provides you with
  a reload button you can use to attempt to fix the problem.
- Extension pages (of other extensions) may be blocked by Chrome when opened from this
  extension. You can manually reload them by clicking the address bar to
  focus it and pressing "Enter" immediately afterwards.
- Your sessions are saved in a bookmark folder named
  "${titles.rootBookmarkNode}" but you can change the title if you wish.
  Be careful of how you and other extensions modify this folder and its
  contents.
- Please don't modify any session's bookmark folder while that session is
  active.
- Please make sure to use other bookmark folders or your reading list to share pages with your
  mobile phone browser in order to avoid modifying the contents of the "${titles.rootBookmarkNode}"
  folder.
- There are many buttons in the UI that allow you to perform many
  functions. Hover over any of them to find out what they do.
- Please don't close the side panel or session manager page while an action you initiated is in
  progress.
- Any session window or tab you close is removed from your current
  session. As such, please use either the "Exit Current Session" or "Close
  All Session Windows" button when you're done with a session to ensure
  that you don't mistakenly remove any tabs or windows from your current
  session.
- Tab group spaces are used to aggregate tab groups of similar colors. Switch between them with the tab group space buttons below or by swiping left and right with two fingers.
- Ungrouped tabs persist between tab group spaces but pinned tabs persist between both tab group spaces and sessions.
- Double-click on any tab to activate the tab and close the side panel in the process.
- If you switch to a new device, you might want to wait a bit for your bookmarks to sync up and restart your browser.
- The rest is pretty intuitive. You'll figure it out.
- I hope you enjoy this extension. Go forth and be productive!
`)} ${infoHeader(
      "Projects that either inspired this extension or tremendously helped in its development",
      true,
    )}
    ${infoButton("Lit", async () => {
      await chrome.tabs.create({ url: "https://lit.dev/" });
    })}
    ${infoButton("Shoelace", async () => {
      await chrome.tabs.create({ url: "https://shoelace.style/" });
    })}
    ${infoButton("Pragmatic drag and drop", async () => {
      await chrome.tabs.create({
        url: "https://atlassian.design/components/pragmatic-drag-and-drop/about",
      });
    })}
    ${infoButton("Fuzzysort", async () => {
      await chrome.tabs.create({ url: "https://github.com/farzher/fuzzysort" });
    })}
    ${infoButton("PromethiumJS", async () => {
      await chrome.tabs.create({ url: "https://promethium.js.org/" });
    })}
    ${infoButton("Arc Browser", async () => {
      await chrome.tabs.create({ url: "https://arc.net/" });
    })}
  `;
}

function App() {
  const helpDialogRef = createRef<SlDialog>();

  return () =>
    html`<div
      id="app"
      style=${styleMap({
        height: "100vh",
        overflow: "hidden",
      })}
    >
      <div
        style=${styleMap({
          width: "min(800px, 90%)",
          margin: "auto",
        })}
      >
        <div
          style=${styleMap({
            fontSize: "--sl-font-size-small",
            width: "100%",
          })}
        >
          <div
            style=${styleMap({
              display: "flex",
              flexDirection: "column",
              paddingBottom: "1.5rem",
            })}
          >
            ${(
              <Dialog
                label="Recent Updates"
                ref={helpDialogRef}
                noTopBodyMargin
                open
                preventClosing
                preventClosingWithEscape
              >
                <Help />
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>`;
}

initApp(App);
