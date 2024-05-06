import { getFaviconUrl } from "./sharedUtils";

const params = new URLSearchParams(document.location.search);
const title = params.get("title");
const url = params.get("url");
const faviconUrl = getFaviconUrl(url);
document.title = title ?? "Augmented Tabflow Stub Page";
(document.querySelector("#favicon-link") as HTMLLinkElement).href = faviconUrl;
