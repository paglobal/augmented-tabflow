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

export function SessionView() {
  return () => {
    return sessionLoading() ||
      currentSessionData() === currentSessionDataNotAvailable ? (
      <Tree contentFn={fallbackTreeContent}></Tree>
    ) : (
      <>
        <Tree
          contentFn={() =>
            promiseWithOneTimeFallback(
              tabGroupTreeContent(),
              fallbackTreeContent(),
            )
          }
          fullHeight
        />
        <TabGroupSpaceSwitcher />
      </>
    );
  };
}
