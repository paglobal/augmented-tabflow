import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./customElements";
import { infoHeader, initApp, infoButton } from "./src/utils";
import { Dialog } from "./src/Dialog";
import { createRef } from "lit/directives/ref.js";
import { SlDialog } from "@shoelace-style/shoelace";

function UpdateAvailable() {
  const params = new URLSearchParams(document.location.search);
  const version = params.get("version");

  return () => html`
    ${infoHeader("Update Available", true)}
    ${infoButton(`Install Update - Version ${version}`, async () => {
      chrome.runtime.reload();
    })}
  `;
}

function App() {
  const updateAvailableDialogRef = createRef<SlDialog>();

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
                ref={updateAvailableDialogRef}
                noTopBodyMargin
                open
                preventClosing
                preventClosingWithEscape
              >
                <UpdateAvailable />
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>`;
}

initApp(App);
