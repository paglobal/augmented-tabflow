# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Now

- add `Grouping Options` for tabs and tab groups to reduce clutter

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
- Use the `Move Or Copy Tab To Session` dialog
- Show whether or not the tab was successfully added to or is already on `Reading List`
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
- change `setTimeouts` to `await wait()`
-
- add last icon(s) in toolbar for `Settings` and `Actions` or `Settings And Actions`
- add all chrome internal pages to search suggestions
- use ctrl+click for alternate click behaviour eg. copy instead of move
- implement group select and bulk actions for various functionality
- collapse tree items in export dialog when done with exporting tab or tab group
- make session trees and other dialog trees react to the necessary app state changes
-
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
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- (maybe) reconcile newly opened session with last recorded session
- (maybe) add splitscreen button for windows
- (maybe) limit number of toasts to be show at a time
- (maybe) add option for showing more options for tabs and tab groups
- (maybe) implement search for sessions and tabs (already implemented in browser for tabs)
- (maybe) implement ability to sort sessions alphabetically or by date added
- (maybe) implement action center and add new shortcuts
- (maybe) add `Pop Out` button/shortcut on extension tab page
- (maybe) implement manual theme switcher
- (maybe) reduce minimum chrome version
- (maybe, please be careful) delete unneeded icons. be sure not to break anything. look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
- (maybe) implement internationalization
-
- try updating the tld list from time to time

### Store Listing

- advise users to always look out for updates and probably suggest how
- remove old video
- upload new video
- attribute projects that made this project possible
- update screenshots. show some fullscreen, some with sessions, show some with split screen, some with tabs, etc
- acknowledge that certain features are only supported and directly enabled by the extension (eg. fullscreen and splitscreen)
- blends with your browser (light and dark modes)

### Help Page

- create help page and remove help dialog
- show help page on install
-
- add donate elements to help page (link to personal site)
- attribute projects that made this project possible
- document behaviour concerning interacting with bookmarking from mobile
- (maybe) document the fact that there's no need to restore old tabs
- document the ability to modify keyboard shortcuts at the top
- document use with your favourite window manager
- direct users where/how to change position of the chrome side panel
- shortcuts include: Open sesssion view in side panel (Alt+A), Close all session windows (Alt+W), Exit current session (Alt+Q), Open new tab (Alt+T), Open new window (Alt+N), Edit current tab address (Alt+L)
- document `Ctrl+Shift+A` shortcut
- document how to force updates
- document how side panel takes focus from page
- document double-click to close side panel
- have button to open recent updates page
- document tab page
- link to chrome keyboard shortcuts page and other necessary pages
- document how pinned tabs persist accross both sessions and tab group spaces button ungrouped tabs persist across only tab group spaces

### Recent Changes Page

- extract `heading` and other utils for use in help page as well
- add donate button
- explain mismatch between `Recent` and `Extensive` on `Extensive`
- add link to help page
-
- persist session on extension updates
- ungrouped tab groups imported from other sessions now import as regular tab group with the title `Ungrouped`
- implemented tab group spaces
- fixed slight hover issue with favicons
- fixed false loading states
- fixed false favicons
- fixed problem with pages loaded with file protocol and possibly other protocols
- implemented navigation box
- access to sessions across devices
- better support for fullscreening
- you can now edit tabs from the sidebar directly
- double-click to close side panel
- create recent updates extension page
- added session manager tab page
