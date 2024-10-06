import { repeat } from "lit/directives/repeat.js";
import { tabGroupTreeData } from "./sessionService";
import { TabGroupTreeItem } from "./TabGroupTreeItem";

export function tabGroupTreeContent() {
  // @handled
  const _tabGroupTreeData = tabGroupTreeData();
  const tabGroupTreeContent = repeat(
    _tabGroupTreeData,
    (tabGroup) => tabGroup.id,
    (tabGroup) => {
      return <TabGroupTreeItem tabGroup={tabGroup} />;
    },
  );

  return tabGroupTreeContent;
}
