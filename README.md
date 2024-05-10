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
- implement window management
- (maybe) show random color when creating new tab group
- fix accessibility issues relating to keyboard navigation in `TreeItem` component (enter should cause element click and other focus related issues)

### Later

- (if necessary) delete unneeded icons. be sure not to break anything if you attempt this! look for instances of `icon` and `sl-icon` element with `name="<icon-name>"`
- (maybe) implement internationalization
- (maybe) cater for more browser eg. by adding more entries to the `newTabUrls` array
- (if necessary) come up with a way to handle storage migrations
- implement theme switcher
- refine and organise text. look for anything in quotation marks like "Error!" and such. make use of full stops
- general code inspection and refactoring
- (if necessary) differentiate state update functions from storage data update functions
- type `setStorageData`, `subscribeToStorageData` and `getStorageData` for automatic inference
- type `sendMessage` and `subscribeToMessage` for automatic inference
- look for `currentlyDeletedBlahBlah` and `currentlyEditedBlahBlah` and make sure they're in the right places. they should probably be in `sessionService.ts` along with their corresponding functions
- implement proper error handling and fallbacks. look for keywords `async`, `await`, `error`, `@`, `@error`, `@fallback`, `@maybe`, `until` and `chrome`
- handle errors in timeouts as well
- notify users of errors that happen in service workers through message `chrome.runtime.message`
- make sure to log caught errors (maybe in dev mode only)
- create util for try catch notify
- resolve unloaded tab status thing with `TreeItemColorPatchOrIcon` component. try to retry and timeout a couple of times
- (if necessary) add alerts for action start and action complete
- (if necessary) add test suite
- create `TreeDialog` and `ConfirmationDialog`
- use `await` anywhere you can. don't use `async-await` in array filter functions
- use early returns anywhere you can
- show warning or error alerts for when certain data is unavailable
- maybe change the way arrays are typed to use `Array<T>`

### Extension

- Upload better screenshots and photos
- Upload better description and summary
- Maybe upload a video

### Docs

- Add reference to video
