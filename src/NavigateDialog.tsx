import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { adaptMemo, adaptState } from "promethium-js";
import fuzzysort from "fuzzysort";
import {
  SlDialog,
  SlInput,
  SlMenu,
  SlMenuItem,
  SlSelectEvent,
} from "@shoelace-style/shoelace";
import { Dialog } from "./Dialog";
import { notify, notifyWithErrorMessageAndReloadButton } from "./utils";
import { debounce, wait } from "../sharedUtils";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { navigate } from "./sessionService";
import { CurrentlyNavigatedTabId } from "../constants";

type Suggestions = Array<{
  value: string;
  type: "history" | "bookmark" | "google";
  title?: string;
}>;

export const navigateInputRef = createRef<SlInput>();
export const navigateDialogRef = createRef<SlDialog>();
export const [currentlyNavigatedTabId, setCurrentlyNavigatedTabId] =
  adaptState<CurrentlyNavigatedTabId | null>(null);

export function NavigateDialog(props: {
  onHide?: () => void;
  open?: boolean;
  onlyInput?: boolean;
}) {
  const suggestionsDebounceTime = 500;
  const maxSuggestionsPerCategory = 5;
  const maxSuggestionsInTotal = 10;

  const [navigationDropdownActive, setNavigationDropdownActive] =
    adaptState<boolean>(false);

  const [previousNavigationInputValue, setPreviousNavigationInputValue] =
    adaptState<string>("");

  const [historySuggestions, setHistorySuggestions] = adaptState<Suggestions>(
    [],
  );
  const getHistorySuggestions = debounce(async () => {
    // @handled
    try {
      setHistorySuggestions([]);
      // slice just to be sure
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 6);
      const startTime = oneMonthAgo.getTime();
      const historySuggestions = (
        await chrome.history.search({
          text: navigateInputRef.value?.value ?? "",
          maxResults: maxSuggestionsPerCategory,
          startTime,
        })
      )
        .slice(0, maxSuggestionsPerCategory)
        .map((suggestedHistoryItem) => ({
          type: "history" as "history",
          value: suggestedHistoryItem.url ?? "",
          title: suggestedHistoryItem.title,
        }));
      setHistorySuggestions(historySuggestions);
    } catch (error) {
      console.error(error);
    }
  }, suggestionsDebounceTime);

  const [bookmarkSuggestions, setBookmarkSuggestions] = adaptState<Suggestions>(
    [],
  );
  const getBookmarkSuggestions = debounce(async () => {
    // @handled
    try {
      setBookmarkSuggestions([]);
      const bookmarkSuggestions = (
        await chrome.bookmarks.search(navigateInputRef.value?.value ?? "")
      )
        .slice(0, maxSuggestionsPerCategory)
        .filter((suggestedBookmark) => suggestedBookmark.url !== undefined)
        .map((suggestedBookmark) => ({
          type: "bookmark" as "bookmark",
          value: suggestedBookmark.url ?? "",
          title: suggestedBookmark.title,
        }));
      setBookmarkSuggestions(bookmarkSuggestions);
    } catch (error) {
      console.error(error);
    }
  }, suggestionsDebounceTime);

  const [googleSuggestions, setGoogleSuggestions] = adaptState<Suggestions>([]);
  const getGoogleSuggestions = debounce(async () => {
    // @handled
    try {
      setGoogleSuggestions([]);
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=chrome&q=${navigateInputRef.value?.value}`,
      );
      const data: Array<string> = (await response.json())[1];
      const googleSuggestions = data
        .slice(0, maxSuggestionsPerCategory)
        .map((suggestedSearchTerm: string) => ({
          type: "google" as "google",
          value: suggestedSearchTerm,
        }));
      setGoogleSuggestions(googleSuggestions);
    } catch (error) {
      console.error(error);
    }
  }, suggestionsDebounceTime);

  const aggregateSuggestions = adaptMemo(() => {
    const intermediateAggregateSuggestions = [
      ...historySuggestions(),
      ...bookmarkSuggestions(),
      ...googleSuggestions(),
    ];
    const encounteredValues: Record<string, boolean> = {};
    const aggregateSuggestions = fuzzysort
      .go(
        navigateInputRef.value?.value ?? "",
        intermediateAggregateSuggestions,
        {
          keys: ["value", "title"],
        },
      )
      .filter((suggestion) => {
        if (encounteredValues[suggestion.obj.value]) {
          return false;
        } else {
          encounteredValues[suggestion.obj.value] = true;

          return true;
        }
      })
      .filter(
        (suggestion) =>
          !suggestion.obj.value.startsWith(
            `chrome-extension://${chrome.runtime.id}`,
          ),
      )
      .slice(0, maxSuggestionsInTotal);

    return aggregateSuggestions;
  });

  const navigateSuggestionsMenuRef = createRef<SlMenu>();

  return () => {
    return (
      <Dialog
        open={props.open}
        preventClosing={props.onlyInput}
        label="Navigate"
        ref={navigateDialogRef}
        onAfterShow={() => {
          setNavigationDropdownActive(false);
        }}
        onAfterHide={() => {
          setNavigationDropdownActive(false);
        }}
        onHide={props.onHide}
      >
        {html`${props.onlyInput
            ? null
            : html`<sl-button-group
                label="Navigation Tools"
                style=${styleMap({
                  fontSize: "1rem",
                  marginTop: "-0.5rem",
                  paddingBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "center",
                })}
              >
                <sl-icon-button
                  name="arrow-left"
                  title="Go Back"
                  @click=${async () => {
                    // @handled
                    try {
                      const _currentyNavigatedTabId = currentlyNavigatedTabId();
                      if (typeof _currentyNavigatedTabId === "number") {
                        await chrome.tabs.goBack(_currentyNavigatedTabId);
                      }
                    } catch (error) {
                      console.error(error);
                      notify("Cannot go back", "primary");
                    }
                  }}
                ></sl-icon-button>
                <sl-icon-button
                  name="arrow-right"
                  title="Go Forward"
                  @click=${async () => {
                    // @handled
                    try {
                      const _currentyNavigatedTabId = currentlyNavigatedTabId();
                      if (typeof _currentyNavigatedTabId === "number") {
                        await chrome.tabs.goForward(_currentyNavigatedTabId);
                      }
                    } catch (error) {
                      console.error(error);
                      notify("Cannot go forward", "primary");
                    }
                  }}
                ></sl-icon-button>
                <sl-icon-button
                  name="arrow-clockwise"
                  title="Reload Page"
                  @click=${async () => {
                    // @handled
                    try {
                      const _currentyNavigatedTabId = currentlyNavigatedTabId();
                      if (typeof _currentyNavigatedTabId === "number") {
                        await chrome.tabs.reload(_currentyNavigatedTabId);
                      }
                    } catch (error) {
                      console.error(error);
                      notifyWithErrorMessageAndReloadButton();
                    }
                  }}
                ></sl-icon-button>
              </sl-button-group>`}
          <sl-popup
            placement="bottom"
            sync="width"
            auto-size="both"
            auto-size-padding="10"
            ?active=${navigationDropdownActive()}
          >
            <sl-input
              ${ref(navigateInputRef)}
              style=${styleMap({
                marginTop: props.onlyInput ? "1rem" : undefined,
              })}
              slot="anchor"
              placeholder="Search"
              autofocus
              autocomplete="off"
              @sl-input=${async () => {
                if (navigateInputRef.value?.value === "") {
                  setNavigationDropdownActive(false);
                } else {
                  getBookmarkSuggestions();
                  getHistorySuggestions();
                  getGoogleSuggestions();
                  setNavigationDropdownActive(true);
                }
              }}
              @keydown=${(e: KeyboardEvent) => {
                const navigationInputValue = navigateInputRef.value?.value;
                if (navigationInputValue !== undefined) {
                  setPreviousNavigationInputValue(navigationInputValue);
                }
                if (e.key === "ArrowDown" || e.key === "Tab") {
                  const newCurrentMenuItem = navigateSuggestionsMenuRef.value
                    ?.firstElementChild as SlMenuItem | null;
                  if (newCurrentMenuItem && navigateInputRef.value) {
                    newCurrentMenuItem?.focus();
                    navigateSuggestionsMenuRef.value?.setCurrentItem(
                      newCurrentMenuItem,
                    );
                    if (e.key === "ArrowDown") {
                      navigateInputRef.value.value = newCurrentMenuItem.value;
                    }
                  }
                } else if (e.key === "ArrowUp") {
                  const newCurrentMenuItem = navigateSuggestionsMenuRef.value
                    ?.lastElementChild as SlMenuItem | null;
                  if (newCurrentMenuItem && navigateInputRef.value) {
                    newCurrentMenuItem?.focus();
                    navigateSuggestionsMenuRef.value?.setCurrentItem(
                      newCurrentMenuItem,
                    );
                    navigateInputRef.value.value = newCurrentMenuItem.value;
                  }
                } else if (e.key === "Enter") {
                  navigate(navigateInputRef.value?.value ?? "");
                }
              }}
            ></sl-input>
            ${aggregateSuggestions().length > 0
              ? html`<sl-menu
                  ${ref(navigateSuggestionsMenuRef)}
                  style=${styleMap({
                    maxWidth: "var(--auto-size-available-width)",
                    maxHeight: "var(--auto-size-available-height)",
                    overflow: "auto",
                  })}
                  @sl-select=${async (e: SlSelectEvent) => {
                    await navigate(e.detail.item.value);
                  }}
                  @scroll=${() => {
                    const firstMenuItem =
                      navigateSuggestionsMenuRef.value?.firstElementChild;
                    const currentMenuItem =
                      navigateSuggestionsMenuRef.value?.getCurrentItem();
                    if (firstMenuItem === currentMenuItem) {
                      navigateSuggestionsMenuRef.value?.scrollTo(0, 0);
                    }
                  }}
                >
                  ${aggregateSuggestions().map((suggestion) => {
                    const suggestionTitleHTML = suggestion.obj.title
                      ? (suggestion[1].highlight() || suggestion.obj.title) +
                        "<br>"
                      : "";
                    const suggestionValueHTML =
                      suggestion[0].highlight() || suggestion.obj.value;

                    return html`
                      <sl-menu-item
                        title=${`${suggestion.obj.title ?? "Untitled"} - ${
                          suggestion.obj.value
                        }`}
                        value=${suggestion.obj.value}
                        @keydown=${async (e: KeyboardEvent) => {
                          if (
                            navigateInputRef.value &&
                            // TODO: recheck this condition
                            e.key !== "Tab"
                          ) {
                            const currentMenuItem =
                              navigateSuggestionsMenuRef.value?.getCurrentItem();
                            if (
                              (e.key === "ArrowDown" &&
                                currentMenuItem ===
                                  navigateSuggestionsMenuRef.value
                                    ?.lastElementChild) ||
                              (e.key === "ArrowUp" &&
                                currentMenuItem ===
                                  navigateSuggestionsMenuRef.value
                                    ?.firstElementChild)
                            ) {
                              e.stopPropagation();
                              navigateInputRef.value.value =
                                previousNavigationInputValue();
                            } else {
                              if (e.key === "ArrowDown") {
                                navigateInputRef.value.value =
                                  (
                                    (navigateSuggestionsMenuRef.value?.getCurrentItem()
                                      ?.nextElementSibling ??
                                      navigateSuggestionsMenuRef.value
                                        ?.firstElementChild) as SlMenuItem
                                  )?.value ?? "";
                              }
                              if (e.key === "ArrowUp") {
                                navigateInputRef.value.value =
                                  (
                                    (navigateSuggestionsMenuRef.value?.getCurrentItem()
                                      ?.previousElementSibling ??
                                      navigateSuggestionsMenuRef.value
                                        ?.lastElementChild) as SlMenuItem
                                  )?.value ?? "";
                              }
                            }
                            navigateInputRef.value.focus();
                            await wait();
                            const inputValueLength =
                              navigateInputRef.value.value.length;
                            navigateInputRef.value.setSelectionRange(
                              inputValueLength,
                              inputValueLength,
                            );
                          }
                        }}
                        @mousemove=${() => {
                          navigateInputRef.value?.focus();
                        }}
                        @mouseenter=${(e: Event) => {
                          const menuItem = e.target as SlMenuItem | null;
                          if (menuItem) {
                            navigateSuggestionsMenuRef.value?.setCurrentItem(
                              menuItem,
                            );
                          }
                          navigateInputRef.value?.focus();
                        }}
                      >
                        ${(
                          <>
                            <TreeItemColorPatchOrIcon
                              slot="prefix"
                              small={true}
                              icon={
                                suggestion.obj.type === "google"
                                  ? "search"
                                  : undefined
                              }
                              pageUrl={
                                suggestion.obj.type !== "google"
                                  ? suggestion.obj.value
                                  : undefined
                              }
                            />
                            {unsafeHTML(
                              `${suggestionTitleHTML}${suggestionValueHTML}`,
                            )}
                          </>
                        )}
                      </sl-menu-item>
                    `;
                  })}
                </sl-menu>`
              : null}
          </sl-popup> `}
      </Dialog>
    );
  };
}
