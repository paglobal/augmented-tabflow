# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Urgent

- fix different bookmark ids on different machines problem
- transfer synced ids to local storage
- add bookmarkers on checking/creation of both
- check for all other valid bookmarks (`Augmented Tabflow Sessions` and `Pinned`)
- transfer children of valid bookmarks into bookmarks with saved ids (`Augmented Tabflow Sessions` and `Pinned`)
- delete all other valid bookmarks (`Augmented Tabflow Sessions` and `Pinned`)
- dedupe bookmarkers (`Augmented Tabflow Sessions` and `Pinned`)
- always aggregate all `Ungrouped` tab group data after importing or exporting (apply functions from above)
- add bookmarkers on save and dedupe bookmarkers (`Augmented Tabflow Sessions` and `Pinned`)
- properly skip over bookmarker when opening pinned tabs
- properly skip over bookmarker when reading sessions data
- pop `Other Bookmarks` onto recently edited bookmarks list after modifications (use bookmarker)
-
- finish navigation dialog implementation
- always match `fullscreen` state with current fullscreen state as long as extension is active
- allow fullscreen toggling via toolbar
- implement local persistence pertaining to window instances (bookmarkId => windowInstanceNumber)
- update local data on every session save
- use local data to open tabs in appropriate window instances on session open
- add two-finger swipe to switch windows
- display other windows in vertical view
- open side-panel in any new windows we create or move to
-
- use popups with `Ctrl + T` and `Alt + L` on fullscreen

### Less Urgent

- report possible bug with menu navigation in shoelace (up and down arrow navigation)
- experiment with focusing the last active element on a page after activating the page
- load all stub pages on startup to ensure that correct icons and titles are shown in chrome tab strip
- add option for adding tab to other tab groups under `Add To Tab Group` (ie. add to some other tab group or a `New Tab Group`)
- add options for merging tab groups with other tab groups under `Ungroup Tabs` (ie. where do you want to move them to? `Ungrouped Tabs` or some other tab group?)
- add dialog for giving name and color to new tab groups created from `Ungrouped Tabs` or `Pinned Tabs`
- implement recently closed tab groups feature
- support moving pinned and ungrouped tab groups to new windows
-
- implement a feature to export tab or tab group to any arbitrary bookmark folder in `Other Bookmarks` and/or `Reading List`
- consider adding button to "look inside" tab groups and import individual tabs
- (maybe) implement search for sessions and tabs (already implemented in browser)
- (maybe) implement ability to sort sessions alphabetically or by date added
-
- break large files into smaller files (look at `NavigateDialog.tsx` and `tabGroupTreeContent.tsx`)
- use `Array<T>` to type arrays
- use `await` anywhere it makes sense. don't use `async-await` in array filter functions though
- use early returns anywhere it makes sense
- migrate fully to JSX
- general code inspection and refactoring
- inspect and verify types across entire codebase
- refine and organise user-facing text. look for anything in quotation marks like "Error!" and such. make use of full stops
- organise imports
- capitalize all instances of `url`
-
- implement manual theme switcher
- implement omnibox opensearch stuff
- use ctrl+click for alternate click behaviour eg. copy instead of move
- (maybe) add `Pop Out` button for picture-in-picture
- implement group select and bulk actions
- collapse tree items in export dialog when done with exporting tab or tab group
- make session trees and other dialog trees react to the necessary app state changes
-
- implement better and more ergonomic error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- create `TreeDialog` and `ConfirmationDialog`
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- handle errors in timeouts as well
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- type drag-and-drop code
- refine fallback code
-
- (maybe) reduce minimum chrome version
- (maybe, please be careful) delete unneeded icons. be sure not to break anything. look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
-
- add test suite
- (maybe) implement internationalization
-
- try updating the tld list from time to time

### Store Listing

- upload new video
- link to chrome keyboard shortcuts page and other necessary pages
- attribute projects that made this project possible

### Help Dialog

- add reference to new youtube video
- attribute projects that made this project possible
- document behaviour concerning interacting with bookmarking from mobile
- (maybe) document the fact that there's no need to restore

### Recent Changes

- fixed problem with pages loaded with file protocol and possibly other protocols
