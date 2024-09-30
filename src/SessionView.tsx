import { Tree } from "./Tree";
import { tabGroupTreeContent } from "./tabGroupTreeContent";

export function SessionView() {
  return () => <Tree contentFn={tabGroupTreeContent} fullHeight></Tree>;
}
