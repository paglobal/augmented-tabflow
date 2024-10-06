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
  SlSelectEvent,
} from "@shoelace-style/shoelace";
import { Dialog } from "./Dialog";
import { notifyWithErrorMessageAndReloadButton } from "./utils";
import { debounce } from "../sharedUtils";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { navigate } from "./sessionService";

type Suggestions = Array<{
  value: string;
  type: "history" | "bookmark" | "google";
  title?: string;
}>;

export const navigateInputRef = createRef<SlInput>();
export const navigateDialogRef = createRef<SlDialog>();
export const [currentlyNavigatedTabId, setCurrentlyNavigatedTabId] = adaptState<
  chrome.tabs.Tab["id"] | null
>(null);

export function NavigateDialog() {
  const suggestionsDebounceTime = 500;
  const maxSuggestionsPerCategory = 5;
  const maxSuggestionsInTotal = 10;

  const [navigationDropdownActive, setNavigationDropdownActive] =
    adaptState<boolean>(false);

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
        }))
        .filter(
          (suggestedHistoryItem) =>
            !suggestedHistoryItem.value.includes(
              `chrome-extension://${chrome.runtime.id}`,
            ),
        );
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
    const aggregateSuggestions = fuzzysort
      .go(
        navigateInputRef.value?.value ?? "",
        intermediateAggregateSuggestions,
        {
          keys: ["value", "title"],
        },
      )
      .slice(0, maxSuggestionsInTotal);

    return aggregateSuggestions;
  });

  const navigateSuggestionsMenuRef = createRef<SlMenu>();

  return () => {
    return (
      <Dialog
        label="Navigate"
        ref={navigateDialogRef}
        onAfterShow={() => {
          setNavigationDropdownActive(false);
        }}
        onAfterHide={() => {
          setNavigationDropdownActive(false);
        }}
      >
        {html`
          ${currentlyNavigatedTabId()
            ? html`
                <sl-button-group
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
                        const _currentyNavigatedTabId =
                          currentlyNavigatedTabId();
                        if (_currentyNavigatedTabId) {
                          await chrome.tabs.goBack(_currentyNavigatedTabId);
                        }
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                  ></sl-icon-button>
                  <sl-icon-button
                    name="arrow-right"
                    title="Go Forward"
                    @click=${async () => {
                      // @handled
                      try {
                        const _currentyNavigatedTabId =
                          currentlyNavigatedTabId();
                        if (_currentyNavigatedTabId) {
                          await chrome.tabs.goForward(_currentyNavigatedTabId);
                        }
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                  ></sl-icon-button>
                  <sl-icon-button
                    name="arrow-clockwise"
                    title="Reload Page"
                    @click=${async () => {
                      // @handled
                      try {
                        const _currentyNavigatedTabId =
                          currentlyNavigatedTabId();
                        if (_currentyNavigatedTabId) {
                          await chrome.tabs.reload(_currentyNavigatedTabId);
                        }
                      } catch (error) {
                        console.error(error);
                        notifyWithErrorMessageAndReloadButton();
                      }
                    }}
                  ></sl-icon-button>
                </sl-button-group>
              `
            : null}
          <sl-popup
            placement="bottom"
            sync="width"
            ?active=${navigationDropdownActive()}
          >
            <sl-input
              ${ref(navigateInputRef)}
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
                if (e.key === "ArrowDown") {
                  (
                    navigateSuggestionsMenuRef.value?.children[1] as HTMLElement
                  )?.focus();
                } else if (e.key === "ArrowUp") {
                  (
                    navigateSuggestionsMenuRef.value
                      ?.lastElementChild as HTMLElement
                  )?.focus();
                } else if (e.key === "Enter") {
                  navigate(navigateInputRef.value?.value ?? "");
                }
              }}
            ></sl-input>
            ${aggregateSuggestions().length > 0
              ? html`<sl-menu
                  ${ref(navigateSuggestionsMenuRef)}
                  @sl-select=${async (e: SlSelectEvent) => {
                    await navigate(e.detail.item.value);
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
                        value=${suggestion.obj.value}
                        @keydown=${(e: KeyboardEvent) => {
                          if (navigateInputRef.value && e.key !== "Tab") {
                            navigateInputRef.value.focus();
                          }
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
                                suggestion.obj.type === "google"
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
          </sl-popup>
        `}
      </Dialog>
    );
  };
}
