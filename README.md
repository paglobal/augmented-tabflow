# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Now

- add two-finger swipe to switch between tab group colors
- open side panel in any new windows we create or move to via the side panel
- show tab group spaces underneath
- custom color scheme for tab group spaces
- (maybe) add nice color transition
- restore certain pieces of state such as user's `currentSession` from local storage on `onUpdated` callback
-
- filter `SessionManager` and `NavigationBox` from tab group tree
- keep record of `AntecedentTabIdInfo` for when navigation box and tab page are open
- change icon for `Add Tab Group`
- group `Ungrouped` tab groups on import
- edit button for tabs doesn't fit when audio icon and favicon are showing, while session is open
- add option for adding tab to other tab groups under `Add To Tab Group` (ie. add to some other tab group or a `New Tab Group` or even ungrouping it)
- add options for merging tab groups with other tab groups under `Add To Tab Group` (ie. where do you want to move them to? `Ungrouped Tabs` or some other tab group?)
- move new tab group to beginning
- fix improper grouping in tab page

### Later

- implement sharing of sessions through plain copied text and through files (`Create Session From File/Text` and `Share Session`)
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
- refine and organise user-facing text. look for anything in quotation marks like "Error!" and such. make use of full stops
- organise imports
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
- fix slight color change issue on tree item text hover
- use `updateComplete` instead of `setTimeout` for waiting for components to change their state
- always aggregate all `Ungrouped` tab group data after importing or exporting (apply functions from above)
- check `migrateAndDedupe` function
- implement better and more ergonomic error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- use more thoughtful error messages
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- handle errors in timeouts as well
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- type drag-and-drop code
- refine fallback code
- add test suite
- look out for instances of typescript `!`'s in the codebae
-
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
- (maybe) support moving whole windows
-
- try updating the tld list from time to time

### Store Listing

- upload new video
- link to chrome keyboard shortcuts page and other necessary pages
- attribute projects that made this project possible
- update screenshots. show some fullscreen, some with sessions, some with tabs, etc

### Help Dialog

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
- add donate
- document tab page

### Recent Changes

- fix slight hover issue with favicons
- add donate button
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
