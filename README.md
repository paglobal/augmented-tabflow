# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Urgent

- fix different bookmark ids on different machines problem
- fix bug with file protocol in prod
- load all stub pages on startup to fix icon and title issue
- fix stale favicon bug
- fix perpetual loading states of tab icons
- attribute projects that made this project possible

### Important

- remove focus from sidebar after activating tab
- work on focus states for tree items after dialog interactions
- consider implementing a feature to export tab or tab group to any arbitrary bookmark folder
- listen to additions to sessionData to update tabs
- display tabs from other windows (maybe)
- implement merge for tab groups
- open side-panel in any new windows
- change `Save Current Session` to `Create Empty Session` when in session
- implement multiple select for actions
- consider always aggregating all `Ungrouped` tab group data after exports
- try reducing minimum chrome version
- use ctrl+click for alternate click behaviour eg. copy instead of move
- in `TreeItem` component, users should be able to click action buttons with the enter key
- collapse tree items when done with exporting tab or tab group
- maybe all newly created tab groups should be hoisted down
- migrate fully to JSX
- remember collapsed state and windows of tab groups
- (maybe) keep already active tab open after session switch
- consider adding button to "look inside" tab groups and import individual tabs
- make session trees and other dialog trees react to the necessary app state changes
- implement recently closed tab groups feature
- consider supporting moving pinned and ungrouped tab groups to new windows
- consider adding button in window to move whole window to another window
- consider adding more info on stub page. eg. "Your page is loading... Click here to reload"
- consider implementing search for sessions and tabs
- consider implementing ability to sort sessions alphabetically or by date added
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
- (if necessary) delete unneeded icons. be sure not to break anything. look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
- (if necessary) add test suite
- consider implementing internationalization
- consider implementing manual theme switcher

### Store listing

- Upload video
- Attribution for projects that made this project possible

### Docs

- Add reference to video
- Attribution for projects that made this project possible
