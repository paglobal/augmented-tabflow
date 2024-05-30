# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Important

- make session trees and other dialog trees react to the necessary app state changes
- open changelog page on extension update
- fix favicon nonsense with `keyed` directive
- fix perpetual loading states of tab icons
- implement recently closed tab groups feature
- fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click and other focus related issues)
- (maybe) support moving pinned and ungrouped tab groups to new windows
- (maybe) add button in window to move whole window to another window
- (maybe) add more info on stub page. eg. "Your page is loading... Click here to reload"
- (maybe) adding ability to import tabs independent of tab groups
- (maybe) implement ability to sort sessions alphabetically or by date added
- try removing all old session tabs at once when switching sessions
- work on focus states for tree items after dialog interactions
- type drag-and-drop code
- general code inspection and refactoring
- refine fallback code
- inspect and verify types across entire codebase
- refine and organise text. look for anything in quotation marks like "Error!" and such. make use of full stops
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
- (maybe) implement internationalization
- (maybe) cater for more browsers eg. by adding more entries to the `newTabUrls` array
- (maybe) implement theme switcher

### Store listing

- Upload better description and summary
- Upload a video
- Link to website
- Add changelog site

### Docs

- Add reference to changelog site
- Add reference to video
