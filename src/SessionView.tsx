import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
  sessionLoading,
} from "./sessionService";
import promiseWithOneTimeFallback from "./promiseWithOneTimeFallback";
import { TabGroupSpaceSwitcher } from "./TabGroupSpaceSwitcher";
import { notifyWithErrorMessageAndReloadButton } from "./utils";

export function SessionView() {
  return () => {
    return sessionLoading() ||
      currentSessionData() === currentSessionDataNotAvailable ? (
      <Tree
        contentFn={fallbackTreeContent}
        errorFn={notifyWithErrorMessageAndReloadButton}
      ></Tree>
    ) : (
      <>
        <Tree
          contentFn={() =>
            promiseWithOneTimeFallback(
              tabGroupTreeContent(),
              fallbackTreeContent(),
            )
          }
          errorFn={notifyWithErrorMessageAndReloadButton}
          // calculate the space occupied by everything above the tree plus additional `1.5rem` padding plus the tab group space switcher height and margins
          // please recalculate accordingly if you change the space occupied by anything above the tree
          height="calc(100vh - 7.75rem - 1.5rem - 2.75rem)"
        />
        <TabGroupSpaceSwitcher />
      </>
    );
  };
}
