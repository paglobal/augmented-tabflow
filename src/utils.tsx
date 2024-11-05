import { SlAlert } from "@shoelace-style/shoelace";
import { render } from "lit";
import { PromethiumNode, adaptState, adaptSyncEffect } from "promethium-js";
import { currentTabGroupSpaceColor } from "./sessionService";

type ThemeMode = "light" | "dark";

export const [themeMode, setThemeMode] = adaptState<ThemeMode>("light");

export const tabGroupColors = () => ({
  grey: themeMode() === "dark" ? "#DADBE0" : "#5E6268",
  blue: themeMode() === "dark" ? "#85A8F8" : "#244BE8",
  red: themeMode() === "dark" ? "#FF7980" : "#F2001B",
  yellow: themeMode() === "dark" ? "#FFDF63" : "#FFAE00",
  green: themeMode() === "dark" ? "#54D796" : "#008E3A",
  pink: themeMode() === "dark" ? "#FF5CCA" : "#EB0082",
  purple: themeMode() === "dark" ? "#DB54F8" : "#BE00F3",
  cyan: themeMode() === "dark" ? "#41DDED" : "#008084",
  orange: themeMode() === "dark" ? "#FFAA6F" : "#FF8739",
});

// copied from "https://shoelace.style/components/alert" and slightly modified
export function notify(
  message: string,
  variant: Exclude<SlAlert["variant"], "neutral"> = "danger",
  duration: number = 3000,
) {
  const icon = {
    danger: "exclamation-octagon",
    success: "check2-circle",
    primary: "info-circle",
    warning: "exclamation-triangle",
  };
  const alert = Object.assign(document.createElement("sl-alert"), {
    variant,
    closable: true,
    duration,
    innerHTML: `<sl-icon name="${icon[variant]}" slot="icon"></sl-icon>${message}`,
  });
  document.body.append(alert);
  alert.toast();
}

export function notifyWithErrorMessageAndReloadButton() {
  const errorMessage =
    "Error occurred while executing action. You can click the button below to attempt to recover.";
  const reloadButtonHTML = `<sl-icon-button name="arrow-clockwise" title="Reload UI" class="reload-button"></sl-icon-button>`;
  const fullMessageContent = `<div>${errorMessage}</div><div style="display: flex; justify-content: center; align-items: center;">${reloadButtonHTML}</div>`;
  notify(fullMessageContent, "danger", 6000);
  document
    .querySelectorAll(".reload-button")
    .forEach((button) =>
      button.addEventListener("click", () => location.reload()),
    );
}

export function initApp(
  App: (props: Object) => () => PromethiumNode,
  initFn?: () => void,
) {
  initFn?.();
  if (window.matchMedia) {
    adaptSyncEffect(() => {
      const _currentTabGroupSpaceColor = currentTabGroupSpaceColor();
      const colorMap: Record<string, string> = {
        grey: "teal",
      };
      const baseAccentColor = _currentTabGroupSpaceColor
        ? colorMap[_currentTabGroupSpaceColor] ?? _currentTabGroupSpaceColor
        : "sky";
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      for (const shade of shades) {
        document.documentElement.style.setProperty(
          `--sl-color-primary-${shade}`,
          `var(--sl-color-${baseAccentColor}-${shade})`,
        );
      }
      document.documentElement.style.setProperty(
        "--sl-input-focus-ring-color",
        "var(--sl-color-primary-200)",
      );
    });
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
  render(<App />, document.body);
}
