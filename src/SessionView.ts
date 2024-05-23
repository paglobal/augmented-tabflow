import { h } from "promethium-js";
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
      currentSessionData() === currentSessionDataNotAvailable
      ? h(Tree, {
          contentFn: fallbackTreeContent,
        })
      : currentSessionData()
      ? h(Tree, {
          contentFn: tabGroupTreeContent,
          fullHeight: true,
        })
      : h(Tree, {
          contentFn: sessionsTreeContent,
          fullHeight: true,
        });
  };
}
