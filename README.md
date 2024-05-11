# Augmented Tabflow

GitHub Repository for the [Augmented Tabflow](https://chromewebstore.google.com/detail/augmented-tabflow/aaopjlakghchpkfolggoiblacllaekho) Chrome extension.

## Note

- Whenever you change [manifest-dev.json](manifest-dev.json), change [manifest-prod.json](manifest-prod.json) accordingly.

## Task List

### Urgent

- implement loading fallback for session and tab group trees which provide a way to exit loading of current session (eg. for when user interrupts session switching
  loading continues indefinitely)
- implement drag-and-drop for tabs, tab groups and sessions
- implement recently closed tab groups feature

### Important

- resolve unloaded tab status thing with `TreeItemColorPatchOrIcon` component. try to retry and timeout a couple of times
- fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click and other focus related issues)
- (if necessary) add alerts for action start and action complete
- general code inspection and refactoring
- inspect and verify types across entire codebase
- refine and organise text. look for anything in quotation marks like "Error!" and such. make use of full stops
- remove all unused imports
- (maybe) organise all imports
- use `Array<T>` to type arrays
- use `await` anywhere you can. don't use `async-await` in array filter functions
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- handle errors in timeouts as well
- (maybe) create utils for try catch notify (separate ones for service worker and async content fns with fallbacks)
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- create `TreeDialog` and `ConfirmationDialog`
- use early returns anywhere you can
- refine fallback code

### Can wait

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
