import { messageTypes } from "./constants";
import { getFaviconUrl, sendMessage } from "./sharedUtils";

const params = new URLSearchParams(document.location.search);
const title = params.get("title");
const url = params.get("url");
const active = params.get("active");
const faviconUrl = getFaviconUrl(url);
document.title = title ?? "Augmented Tabflow Stub Page";
if (url !== null) {
  (document.querySelector("#favicon-link") as HTMLLinkElement).href =
    faviconUrl;
}
if (active) {
  sendMessage({ type: messageTypes.restoreTab });
}
document.addEventListener("click", async () => {
  await sendMessage({ type: messageTypes.restoreTab });
});
document.addEventListener("keypress", async () => {
  await sendMessage({ type: messageTypes.restoreTab });
});
