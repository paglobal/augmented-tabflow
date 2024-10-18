import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { fallbackTreeContent } from "./fallbackTreeContent";
import {
  currentSessionData,
  currentSessionDataNotAvailable,
  sessionLoading,
} from "./sessionService";

export function SessionView() {
  return () => {
    return sessionLoading() ||
      currentSessionData() === currentSessionDataNotAvailable ? (
      <Tree contentFn={fallbackTreeContent}></Tree>
    ) : (
      <Tree contentFn={tabGroupTreeContent} fullHeight></Tree>
    );
  };
}
