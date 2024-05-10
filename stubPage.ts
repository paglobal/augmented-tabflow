import { messageTypes, newTabUrls } from "./constants";
import { getFaviconUrl, sendMessage } from "./sharedUtils";

const params = new URLSearchParams(document.location.search);
const title = params.get("title");
const url = params.get("url") ?? newTabUrls[0];
const active = params.get("active");
const faviconUrl = getFaviconUrl(url);
document.title = title ?? "Augmented Tabflow Stub Page";
(document.querySelector("#favicon-link") as HTMLLinkElement).href = faviconUrl;
if (active) {
  sendMessage({ type: messageTypes.restoreTab });
}
