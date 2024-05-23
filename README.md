# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.
- Restart dev server whenever you change [manifest-dev.json](manifest-dev.json), [manifest-prod.json](manifest-prod.json) or anything in [public](public).

## Task List

### Important

- preserve state of session trees after use
- consider making stub tab page the new tab page
- always create new ungrouped tab group data for sessions if unavailable in `importTabGroupFreeSessionTreeContent` and `moveOrCopyToSessionTreeContent`. show only one at a time
- add more info on stub page. eg. "Your page is loading... Click here to reload"
- fix perpetual loading states of tab icons
- fix favicon nonsense
- support moving pinned and ungrouped tab groups to new windows
- allow moving ungrouped tab group data to other sessions
- consider hiding dialogs at the beginning of actions or not hiding some of them at all
- work on focus states for tree items after dialog interactions
- try removing all old session tabs at once when switching sessions
- experiment in promethium-js with a state watcher mixin instead of the h function
- implement recently closed tab groups feature
- implement ability to sort sessions alphabetically or by date added
- fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click and other focus related issues)
- always show ungrouped in the "move to session dialog" for tabs
- type drag-and-drop code
- general code inspection and refactoring
- refine fallback code
- (if necessary) add alerts for action start and action complete
- inspect and verify types across entire codebase
- refine and organise text. look for anything in quotation marks like "Error!" and such. make use of full stops
- remove all unused imports
- (maybe) organise all imports
- use `Array<T>` to type arrays
- use `await` anywhere it makes sense. don't use `async-await` in array filter functions though
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- create `TreeDialog` and `ConfirmationDialog`
- implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- have a go at the `closed message channel before response` error
- handle errors in timeouts as well
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- use early returns anywhere it makes sense
- (if necessary) delete unneeded icons. be sure not to break anything. look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
- (if necessary) add test suite
- (maybe) implement internationalization
- (maybe) cater for more browsers eg. by adding more entries to the `newTabUrls` array
- (maybe) implement theme switcher

### Store listing

- Upload better screenshots and photos
- Upload better description and summary
- Maybe upload a video

### Docs

- Add reference to video
- Popups not supported
- Don't mind errors unless they affect the way you use the extension
- You can't create any new windows or tabs in the beginning stages of switching to a new session
- When you close a window, all it's tabs move to another session window if any is available
- Tabs load when activated
- Click page or press any button to reload. Don't try to reload using any other means
