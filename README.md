# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Now

- navigation box opens new tab when form is submitted empty
- check if newtaburls is necessary or detrimental
- fix wheel event volatility
- fix wheel event overfiring
- switch to session on save for current session
- reconcile newly opened session with last recorded session
- look into passive mode for wheel event
- focus `sky` tab group space when active tab is not in current tab group space
- try scrolling active tab into view on first render
- do initting in `onStartup` instead of raw in background script
- don't unpin tabs after changing url
- implement "check for updates" feature
- check issue with not restoring session state on update
- don't track fullscreen state
- add shortcut for full screen mode
- reduce flashes when closing session windows
- add shortcut for open new tab in current tab group
- delete all `navigationBox` and `sessionManager` urls from history
- add `Grouping Options` for tabs and tab groups to reduce clutter
- implement shortcut for moving to previous tab

### Later

- add window manipulation options through action buttons (eg. support moving whole windows)
- fix slight color change issue on tree item text hover
- always aggregate all `Ungrouped` tab group data after importing or exporting
- implement sharing of sessions through plain copied text and through files (`Create Session From Text`, `Create Tab Group From Text`, `Share Session` and `Share TabGroup`)
- implement omnibox opensearch stuff with `activeTab` permission restrictions in mind
- add badge for address (maybe) with reload, forward and back buttons
- add commands to group tabs according to domain, title similarity and other stuff
- load all stub pages on startup to ensure that correct icons and titles are shown in chrome tab strip
- implement recently closed tab groups feature
- support moving pinned and ungrouped tab groups to new windows
-
- implement a feature to export tab or tab group to any arbitrary bookmark folder in `Other Bookmarks` and/or `Reading List`
- implement a feature to view reading list
- Show whether or not the tab was successfully added to or is already on `Reading List`
- Use the `Move Or Copy Tab To Session` dialog
- consider adding button to "look inside" tab groups and import individual tabs
-
- break large files into smaller files (look at `NavigateDialog.tsx` and `tabGroupTreeContent.tsx`)
- use `Array<T>` to type arrays
- use `await` anywhere it makes sense. don't use `async-await` in array filter functions though
- use early returns anywhere it makes sense
- migrate fully to JSX
- general code inspection and refactoring
- inspect and verify types across entire codebase
- organise imports
- refine and organise user-facing text. look for anything in quotation marks like "Error!" and such. make use of full stops
- capitalize all instances of `url`
- change `setTimeout`'s to `await wait()`
-
- add last icon(s) in toolbar for `Settings` and `Actions` or `Settings And Actions`
- add all chrome internal pages to search suggestions
- use ctrl+click for alternate click behaviour eg. copy instead of move
- implement group select and bulk actions for various functionality
- collapse tree items in export dialog when done with exporting tab or tab group
- make session trees and other dialog trees react to the necessary app state changes
-
- litter the code with comments and ui alerts
- implement `pathNameToUrl` utility
- check `migrateAndDedupe` function
- use `updateComplete` instead of `setTimeout` for waiting for components to change their state
- implement better and more ergonomic error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `@handled`, `@handle`, `@revisit`, `until` and `chrome`
- use more thoughtful error messages
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- handle errors in timeouts as well
- type drag-and-drop code
- refine fallback code
- add test suite
- look out for instances of typescript `!`'s in the codebase
- look out for uses of typescript `as`'s in the codebase
- add `| Undefined` to all `Array` types
-
- (maybe) move all ungrouped tabs to the end always
- (maybe) add message for creating bookmark nodes
- (maybe) create ui for editing commands
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- (maybe) add splitscreen button for windows
- (maybe) limit number of toasts to be show at a time
- (maybe) add option for showing more options for tabs and tab groups
- (maybe) implement search for sessions and tabs (already implemented in browser for tabs)
- (maybe) implement ability to sort sessions alphabetically or by date added
- (maybe) implement action center and add new shortcuts
- (maybe) implement manual theme switcher
- (maybe) reduce minimum chrome version
- (maybe, please be careful) delete unneeded icons. be sure not to break anything. look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
- (maybe) implement internationalization
-
- try updating the tld list from time to time
