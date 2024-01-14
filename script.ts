import { html } from "lit";
import { h, renderTemplateFn } from "promethium-js";
import { App } from "./src/App";

renderTemplateFn(() => html`${h(App)}`, { renderContainer: "body" });

//auto light/dark mode based on user preferences
if (window.matchMedia) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("sl-theme-dark");
  }
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("sl-theme-dark");
      } else {
        document.documentElement.classList.remove("sl-theme-dark");
      }
    });
}
