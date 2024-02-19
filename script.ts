import { html } from "lit";
import { h, renderTemplateFn, adaptState } from "promethium-js";
import { App } from "./src/App";

renderTemplateFn(() => html`${h(App)}`, { renderContainer: "body" });

export const [themeMode, setThemeMode] = adaptState<"light" | "dark">("light");

//auto light/dark mode based on user preferences
if (window.matchMedia) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setThemeMode("dark");
    document.documentElement.classList.add("sl-theme-dark");
  } else {
    setThemeMode("light");
    document.documentElement.classList.remove("sl-theme-dark");
  }
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeMode("dark");
        document.documentElement.classList.add("sl-theme-dark");
      } else {
        setThemeMode("light");
        document.documentElement.classList.remove("sl-theme-dark");
      }
    });
}
