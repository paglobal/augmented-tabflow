import { SlAlert } from "@shoelace-style/shoelace";
import { adaptState } from "promethium-js";

export const [themeMode, setThemeMode] = adaptState<"light" | "dark">("light");

export const tabGroupColors = () => ({
  grey: themeMode() === "dark" ? "#DADBE0" : "#5E6268",
  blue: "#85A8F8",
  red: "#FF7980",
  yellow: "#FFDF63",
  green: "#54D796",
  pink: "#FF5CCA",
  purple: "#DB54F8",
  cyan: "#41DDED",
  orange: "#FFAA6F",
});

// copied from "https://shoelace.style/components/alert" and slightly modified
export function notify(
  message: string,
  variant: SlAlert["variant"] = "danger",
) {
  const icon = {
    danger: "exclamation-octagon",
    success: "check2-circle",
    warning: "exclamation-triangle",
  };
  const alert = Object.assign(document.createElement("sl-alert"), {
    variant,
    closable: true,
    duration: 3000,
    innerHTML: `
        <sl-icon name="${icon[variant]}" slot="icon"></sl-icon>
        ${message}
      `,
  });
  document.body.append(alert);
  alert.toast();
}

// TODO: implement proper error handling. please!!!
// look for keywords `async` and `chrome`
// TODO: implement internationalization
// TODO: add tsc type-checking to dev workflow
// TODO: try removing unused icons from assets without breaking anything, or dont! either way, GOOD LUCK!
// TODO: promethium-js: allow promises in `adaptEffect`
// TODO: promethium-js: fix type for `h` directive
