import { styleMap } from "lit/directives/style-map.js";
import { Ref, ref } from "lit/directives/ref.js";
import { SlInput, SlMenu, SlMenuItem } from "@shoelace-style/shoelace";
import { PromethiumNode, adaptState } from "promethium-js";
import { wait } from "../sharedUtils";

export function Combobox(props: {
  inputRef: Ref<SlInput>;
  suggestionsMenuRef: Ref<SlMenu>;
  updateSuggestions: () => void;
  selectInputOrSuggestion: (inputOrSuggestion: string) => void;
  suggestions: Array<{
    title?: string;
    value: string;
    content: PromethiumNode;
  }>;
}) {
  const [previousInputValue, setPreviousInputValue] = adaptState<string>("");

  return () => {
    const dropdownActive = props.inputRef.value?.value === "" ? false : true;

    return (
      <sl-popup
        placement="bottom"
        sync="width"
        auto-size="both"
        auto-size-padding="10"
        bool:active={dropdownActive}
      >
        <sl-input
          use:ref={ref(props.inputRef)}
          slot="anchor"
          placeholder="Search"
          autofocus
          autocomplete="off"
          on:sl-input={async () => {
            props.updateSuggestions();
          }}
          on:keydown={(e: KeyboardEvent) => {
            const inputValue = props.inputRef.value?.value;
            if (inputValue !== undefined) {
              setPreviousInputValue(inputValue);
            }
            if (e.key === "ArrowDown" || e.key === "Tab") {
              const newCurrentMenuItem = props.suggestionsMenuRef.value
                ?.firstElementChild as SlMenuItem | null;
              if (newCurrentMenuItem && props.inputRef.value) {
                newCurrentMenuItem?.focus();
                props.suggestionsMenuRef.value?.setCurrentItem(
                  newCurrentMenuItem,
                );
                if (e.key === "ArrowDown") {
                  props.inputRef.value.value = newCurrentMenuItem.value;
                }
              }
            } else if (e.key === "ArrowUp") {
              const newCurrentMenuItem = props.suggestionsMenuRef.value
                ?.lastElementChild as SlMenuItem | null;
              if (newCurrentMenuItem && props.inputRef.value) {
                newCurrentMenuItem?.focus();
                props.suggestionsMenuRef.value?.setCurrentItem(
                  newCurrentMenuItem,
                );
                props.inputRef.value.value = newCurrentMenuItem.value;
              }
            } else if (e.key === "Enter") {
              props.selectInputOrSuggestion(props.inputRef.value?.value ?? "");
            }
          }}
        ></sl-input>
        {props.suggestions.length <= 0 ? null : (
          <sl-menu
            use:ref={ref(props.suggestionsMenuRef)}
            $attr:style={styleMap({
              maxWidth: "var(--auto-size-available-width)",
              maxHeight: "var(--auto-size-available-height)",
              overflow: "auto",
            })}
            on:sl-select={async (e) => {
              props.selectInputOrSuggestion(e.detail.item.value);
            }}
            on:scroll={() => {
              const firstMenuItem =
                props.suggestionsMenuRef.value?.firstElementChild;
              const currentMenuItem =
                props.suggestionsMenuRef.value?.getCurrentItem();
              if (firstMenuItem === currentMenuItem) {
                props.suggestionsMenuRef.value?.scrollTo(0, 0);
              }
            }}
          >
            {props.suggestions.map((suggestion) => {
              return (
                <sl-menu-item
                  title={`${suggestion.title ?? "Untitled"} - ${
                    suggestion.value
                  }`}
                  value={suggestion.value}
                  on:keydown={async (e: KeyboardEvent) => {
                    if (
                      props.inputRef.value &&
                      // TODO: recheck this condition
                      e.key !== "Tab"
                    ) {
                      const currentMenuItem =
                        props.suggestionsMenuRef.value?.getCurrentItem();
                      if (
                        (e.key === "ArrowDown" &&
                          currentMenuItem ===
                            props.suggestionsMenuRef.value?.lastElementChild) ||
                        (e.key === "ArrowUp" &&
                          currentMenuItem ===
                            props.suggestionsMenuRef.value?.firstElementChild)
                      ) {
                        e.stopPropagation();
                        props.inputRef.value.value = previousInputValue();
                      } else {
                        if (e.key === "ArrowDown") {
                          props.inputRef.value.value =
                            (
                              (props.suggestionsMenuRef.value?.getCurrentItem()
                                ?.nextElementSibling ??
                                props.suggestionsMenuRef.value
                                  ?.firstElementChild) as SlMenuItem
                            )?.value ?? "";
                        }
                        if (e.key === "ArrowUp") {
                          props.inputRef.value.value =
                            (
                              (props.suggestionsMenuRef.value?.getCurrentItem()
                                ?.previousElementSibling ??
                                props.suggestionsMenuRef.value
                                  ?.lastElementChild) as SlMenuItem
                            )?.value ?? "";
                        }
                      }
                      props.inputRef.value.focus();
                      await wait();
                      const inputValueLength =
                        props.inputRef.value.value.length;
                      props.inputRef.value.setSelectionRange(
                        inputValueLength,
                        inputValueLength,
                      );
                    }
                  }}
                  on:mousemove={() => {
                    props.inputRef.value?.focus();
                  }}
                  on:mouseenter={(e: Event) => {
                    const menuItem = e.target as SlMenuItem | null;
                    if (menuItem) {
                      props.suggestionsMenuRef.value?.setCurrentItem(menuItem);
                    }
                    props.inputRef.value?.focus();
                  }}
                >
                  {suggestion.content}
                </sl-menu-item>
              );
            })}
          </sl-menu>
        )}
      </sl-popup>
    );
  };
}
