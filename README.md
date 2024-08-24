# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Urgent

- fix different bookmark ids on different machines problem
- fix bug with file and other protocols in prod
- fix stale favicon bug and perpetual loading states
- display other windows in vertical view
- change `Save Current Session` to `Create Empty Session` when in session
- implement rule for grouping tab groups into windows by color (it should affect moving tab groups to other windows)
- support moving pinned and ungrouped tab groups to new windows

### Less Urgent

- (maybe) implement a feature to export tab or tab group to any arbitrary bookmark folder in `Other Bookmarks`
- implement recently closed tab groups feature
- (maybe) alway aggregate all `Ungrouped` tab group data after exports
- (maybe) add option to group ungrouped tabs in import dialog
- (maybe) implement group select and bulk actions
- (maybe) keep already active tab open after session switch
- (maybe) try loading all stub pages on startup to ensure that correct icons and titles are shown in chrome tab strip
- try reducing minimum chrome version
- remove focus from sidebar after activating tab
- work on focus states for tree items after dialog interactions
- (maybe) listen to additions to sessionData to update tabs
- implement merge for tab groups
- open side-panel in any new windows
- implement multiple select for actions
- use ctrl+click for alternate click behaviour eg. copy instead of move
- in `TreeItem` component, users should be able to click action buttons with the enter key
- collapse tree items in export dialog when done with exporting tab or tab group
- maybe all newly created tab groups should be hoisted down
- migrate fully to JSX
- consider adding button to "look inside" tab groups and import individual tabs
- make session trees and other dialog trees react to the necessary app state changes
- (maybe) add more info on stub page. eg. "Your page is loading... Click here to reload"
- (maybe) implement search for sessions and tabs
- (maybe) implement ability to sort sessions alphabetically or by date added

### Later

- type drag-and-drop code
- general code inspection and refactoring
- refine fallback code
- inspect and verify types across entire codebase
- refine and organise user-facing text. look for anything in quotation marks like "Error!" and such. make use of full stops
- organise imports
- use `Array<T>` to type arrays
- use `await` anywhere it makes sense. don't use `async-await` in array filter functions though
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- create `TreeDialog` and `ConfirmationDialog`
- implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- handle errors in timeouts as well
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- use early returns anywhere it makes sense
- (maybe, please be careful) delete unneeded icons. be sure not to break anything. look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
- add test suite
- (maybe) implement internationalization
- (maybe) implement manual theme switcher

### Store listing

- upload new video
- attribute projects that made this project possible

### Help Dialog

- add reference to new youtube video
- attribute projects that made this project possible
