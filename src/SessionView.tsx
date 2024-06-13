import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";
import { sessionsTreeContent } from "./sessionsTreeContent";
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
    ) : currentSessionData() ? (
      <Tree contentFn={tabGroupTreeContent} fullHeight></Tree>
    ) : (
      <Tree contentFn={sessionsTreeContent} fullHeight></Tree>
    );
  };
}
