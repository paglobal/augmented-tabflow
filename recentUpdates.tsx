import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./customElements";
import { initApp } from "./src/utils";
import { Dialog } from "./src/Dialog";
import { createRef } from "lit/directives/ref.js";
import { SlDialog } from "@shoelace-style/shoelace";
import { extensiveUpdateListPage } from "./constants";

function RecentUpdates() {
  const header = (version: string, noBottomPadding?: boolean) => {
    return html`
      <p
        style=${styleMap({
          fontSize: "1.1rem",
          paddingTop: "1.6rem",
          paddingBottom: noBottomPadding ? undefined : "1.6rem",
          textDecoration: "underline",
        })}
      >
        ${version}
      </p>
    `;
  };

  const updateList = (text: string) => {
    return html`<ul>
      ${text.split("\n").map((textSegment) => html`<li>${textSegment}</li>`)}
    </ul>`;
  };

  return () => html`
    <style>
      div ul li {
        padding-bottom: 0.8rem;
        line-height: 150%;
      }
      div ul li:last-child {
        padding-bottom: 0;
      }
    </style>
    ${header("Recent Updates", true)} ${header("0.8.1")}
    ${updateList(`Fixed an issue with restoring pinned tabs.
Fixed an issue with the height of dialogs that occurs when the sidepanel is expanded beyond a certain width.`)} ${header(
      "0.8.0",
    )}
    ${updateList(`Added a changelog page.
Added more information to the help dialog.`)}
    <sl-button
      variant="primary"
      style=${styleMap({
        marginTop: "1.6rem",
      })}
      @click=${async () => {
        await chrome.tabs.create({ url: extensiveUpdateListPage });
      }}
      >Check out extensive list of updates here</sl-button
    >
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
