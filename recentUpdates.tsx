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
  donationsPage,
  extensiveUpdateListPage,
  helpPathName,
} from "./constants";

function RecentUpdates() {
  return () => html`
    ${infoListStyles()} ${infoHeader("Recent Updates", true)}
    ${infoHeader("0.9.0 to 0.13.0")} ${infoList(`
- Added a new recent updates page.
- Changed help dialog to help page.
- Sessions now persist on extension updates.
- Ungrouped tab groups imported from other sessions now import as regular tab groups with the title "Ungrouped".
- Implemented tab group spaces to improve organization within sessions.
- Fixed slight hover issue with favicons.
- Fixed showing of certain false loading states pertaining to tabs.
- Fixed issue with stale favicons showing instead of current ones.
- Fixed problem with pages loaded with file protocol and possibly other protocols.
- Implemented navigation box.
- Implemented better support for fullscreening in order to encourage hiding on horizontal tab strip.
- Tabs can now be edited directly from the sidebar. 
- Tabs can now be double-clicked on to activate them and close the sidebar in the process.
- Added action popup.
- Fixed issues with pinned tabs
`)} ${infoHeader("0.8.1")} ${infoList(`
- Fixed an issue with restoring pinned tabs.
- Fixed an issue with the height of dialogs that occurs when the sidepanel is expanded beyond a certain width.`)} ${infoHeader(
      "0.8.0",
    )}
    ${infoList(`
- Added a changelog page.
- Added more information to the help dialog.`)} ${infoButton(
      "Extensive Update List",
      async () => {
        await chrome.tabs.create({ url: extensiveUpdateListPage });
      },
    )}
    ${infoButton("Help", async () => {
      await chrome.tabs.create({ url: helpPathName });
    })}
    ${infoButton("Donate", async () => {
      await chrome.tabs.create({ url: donationsPage });
    })}
  `;
}

function App() {
  const recentUpdatesDialogRef = createRef<SlDialog>();

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
                ref={recentUpdatesDialogRef}
                noTopBodyMargin
                open
                preventClosing
                preventClosingWithEscape
              >
                <RecentUpdates />
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>`;
}

initApp(App);
