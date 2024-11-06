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
import { extensiveUpdateListPage, helpPathName } from "./constants";

function RecentUpdates() {
  return () => html`
    ${infoListStyles()} ${infoHeader("Recent Updates", true)}
    ${infoHeader("0.9.0 to 0.12.0")} ${infoList(`
- new updates page
- new help page
- persist session on extension updates
- ungrouped tab groups imported from other sessions now import as regular tab group with the title "Ungrouped"
- implemented tab group spaces
- fixed slight hover issue with favicons
- fixed false loading states
- fixed false favicons
- fixed problem with pages loaded with file protocol and possibly other protocols
- implemented navigation box
- access to sessions across devices
- better support for fullscreening
- you can now edit tabs from the sidebar directly
- double-click to close side panel
- create recent updates extension page
- added session manager tab page
`)} ${infoHeader("0.8.1")} ${infoList(`
- Fixed an issue with restoring pinned tabs.
- Fixed an issue with the height of dialogs that occurs when the sidepanel is expanded beyond a certain width.`)} ${infoHeader(
      "0.8.0",
    )}
    ${infoList(`
- Added a changelog page.
- Added more information to the help dialog.`)} ${infoButton(
      "Check out extensive list of updates here",
      async () => {
        await chrome.tabs.create({ url: extensiveUpdateListPage });
      },
    )}
    <br />
    ${infoButton("Help", async () => {
      await chrome.tabs.create({ url: helpPathName });
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
                open={true}
                preventClosing={true}
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
