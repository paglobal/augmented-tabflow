import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./customElements";
import { infoHeader, initApp, infoList, infoListStyles } from "./src/utils";
import { Dialog } from "./src/Dialog";
import { createRef } from "lit/directives/ref.js";
import { SlDialog } from "@shoelace-style/shoelace";
import { titles } from "./constants";

function Help() {
  return () => html`
    ${infoListStyles()} ${infoHeader("Help", true)}
    ${infoHeader(
      "Here are a few things you need to know when working with this extension",
    )}
    ${infoList(`
- It allows you to save your sessions as bookmarks that are automatically
  updated anytime you make a change to your current active saved session.
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
- There are many buttons in the UI that allow you to perform many
  functions. Hover over any of them to find out what they do.
- Please don't close the side panel or session manager page while an action you initiated is in
  progress.
- Any session window or tab you close is removed from your current
  session. As such, please use either the "Exit Current Session" or "Close
  All Session Windows" button when you're done with a session to ensure
  that you don't mistakenly remove any tabs or windows from your current
  session.
- Pinned tabs are not specific to any session as so stay open throughout
  all sessions, even unsaved ones.
- Please make sure to use other bookmark folders or your reading list to share pages with your
  mobile phone browser in order to avoid modifying the contents of the "${titles.rootBookmarkNode}"
  folder.
- The rest is pretty intuitive. You'll figure it out.
- I hope you enjoy this extension. Go forth and be productive!
`)}
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
                <Help />
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>`;
}

initApp(App);
