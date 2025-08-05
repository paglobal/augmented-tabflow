import { styleMap } from "lit/directives/style-map.js";
import { createRef } from "lit/directives/ref.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { adaptMemo, adaptState } from "promethium-js";
import fuzzysort from "fuzzysort";
import { SlDialog, SlInput, SlMenu } from "@shoelace-style/shoelace";
import { Dialog } from "./Dialog";
import { notify, notifyWithErrorMessageAndReloadButton } from "./utils";
import { debounce } from "../sharedUtils";
import { TreeItemColorPatchOrIcon } from "./TreeItemColorPatchOrIcon";
import { navigate } from "./sessionService";
import { CurrentlyNavigatedTabId } from "../constants";
import { Combobox } from "./Combobox";

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

  const navigateSuggestionsMenuRef = createRef<SlMenu>();

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

  function updateSuggestions() {
    getBookmarkSuggestions();
    getHistorySuggestions();
    getGoogleSuggestions();
  }

  return () => {
    const suggestions = aggregateSuggestions().map((suggestion) => {
      const titleHTML = suggestion.obj.title
        ? (suggestion[1].highlight() || suggestion.obj.title) + "<br>"
        : "";
      const valueHTML = suggestion[0].highlight() || suggestion.obj.value;
      const content = (
        <>
          <TreeItemColorPatchOrIcon
            slot="prefix"
            small={true}
            icon={suggestion.obj.type === "google" ? "search" : undefined}
            pageUrl={
              suggestion.obj.type !== "google"
                ? suggestion.obj.value
                : undefined
            }
          />
          {unsafeHTML(`${titleHTML}${valueHTML}`)}
        </>
      );

      return {
        title: suggestion.obj.title,
        value: suggestion.obj.value,
        content,
      };
    });

    return (
      <Dialog
        open={props.open}
        preventClosing={props.onlyInput}
        label="Navigate"
        ref={navigateDialogRef}
        onHide={props.onHide}
      >
        {props.onlyInput ? (
          <div
            $attr:style={styleMap({
              marginTop: props.onlyInput ? "1rem" : undefined,
            })}
          ></div>
        ) : (
          <sl-button-group
            label="Navigation Tools"
            $attr:style={styleMap({
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
              on:click={async () => {
                // @handled
                try {
                  const _currentlyNavigatedTabId = currentlyNavigatedTabId();
                  if (typeof _currentlyNavigatedTabId === "number") {
                    await chrome.tabs.goBack(_currentlyNavigatedTabId);
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
              on:click={async () => {
                // @handled
                try {
                  const _currentlyNavigatedTabId = currentlyNavigatedTabId();
                  if (typeof _currentlyNavigatedTabId === "number") {
                    await chrome.tabs.goForward(_currentlyNavigatedTabId);
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
              on:click={async () => {
                // @handled
                try {
                  const _currentlyNavigatedTabId = currentlyNavigatedTabId();
                  if (typeof _currentlyNavigatedTabId === "number") {
                    await chrome.tabs.reload(_currentlyNavigatedTabId);
                  }
                } catch (error) {
                  console.error(error);
                  notifyWithErrorMessageAndReloadButton();
                }
              }}
            ></sl-icon-button>
          </sl-button-group>
        )}
        <Combobox
          inputRef={navigateInputRef}
          suggestionsMenuRef={navigateSuggestionsMenuRef}
          updateSuggestions={updateSuggestions}
          selectInputOrSuggestion={navigate}
          suggestions={suggestions}
        ></Combobox>
      </Dialog>
    );
  };
}
