# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Urgent

- always aggregate all `Ungrouped` tab group data after importing or exporting (apply functions from above)
-
- implement local persistence pertaining to window instances (bookmarkNodeId => windowInstanceNumber)
- update local data on every session save
- use local data to open tabs in appropriate window instances on session open
- display other windows in vertical view
- add two-finger swipe to switch windows
- open side-panel in any new windows we create or move to

### Less Urgent

- experiment with focusing the last active element on a page after activating the page
- look into (false) loading states
- report possible bug with menu navigation in shoelace (up and down arrow navigation)
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
- add all chrome internal pages to search suggestions
- use ctrl+click for alternate click behaviour eg. copy instead of move
- (maybe) add `Pop Out` button for picture-in-picture
- implement group select and bulk actions
- collapse tree items in export dialog when done with exporting tab or tab group
- make session trees and other dialog trees react to the necessary app state changes
-
- implement better and more ergonomic error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- handle errors in timeouts as well
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- type drag-and-drop code
- refine fallback code
- look out for instances of typescript `!`'s in the codebae
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
- (maybe) document the fact that there's no need to restore old tabs
- document the ability to modify keyboard shortcuts at the top
- document use with your favourite window manager
- document `Ctrl+Shift+A` shortcut

### Recent Changes

- fixed problem with pages loaded with file protocol and possibly other protocols
