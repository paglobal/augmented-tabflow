import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { titles } from "../constants";

export function Help() {
  return () => html`
    <style>
      div ul li {
        padding-bottom: 0.8rem;
        line-height: 150%;
      }
      div ul li:last-child {
        padding-bottom: 0;
      }
    </style>
    <p
      style=${styleMap({
        fontSize: "1.1rem",
        paddingBottom: "1.6rem",
        textDecoration: "underline",
        textAlign: "center",
      })}
    >
      Here are a few things you need to know when working with this extension
    </p>
    <ul>
      <li>
        It allows you to save your sessions as bookmarks that are automatically
        updated anytime you make a change to your current active saved session.
      </li>
      <li>
        Even though this tab integrates extremely well with tab groups, if you
        save your tab groups natively in Chrome, you can't edit them in some
        ways with this extension because of the way saved tab groups currently
        work in Chrome. We hope this gets fixed in the future.
      </li>
      <li>
        Sessions normally consist of all tabs from all "normal" windows (no
        popups, PWAs, etc).
      </li>
      <li>
        Because this extension enables you to restore sessions easily, you can
        turn of session restoration in Chrome if you have it enabled.
      </li>
      <li>
        In rare cases where session switching takes too long (eg. if you
        interrupt the process unintentionally), the extension provides you with
        a reload button you can use to attempt to fix the problem.
      </li>
      <li>
        Extension pages (of other extensions) may be blocked by Chrome when
        restored. You can manually reload them by clicking the address bar to
        focus it and pressing "Enter" immediately afterwards.
      </li>
      <li>
        Your sessions are saved in a bookmark folder named
        "${titles.rootBookmarkNode}" but you can change the title if you wish.
        Be careful of how you and other extensions modify this folder and its
        contents.
      </li>
      <li>
        Please don't modify any session's bookmark folder while that session is
        active.
      </li>
      <li>
        There are many buttons in the UI that allow you to perform many
        functions. Hover over any of them to find out what they do.
      </li>
      <li>
        Please don't close the side panel while an action you initiated is in
        progress.
      </li>
      <li>The rest is pretty intuitive. You'll figure it out.</li>
      <li>I hope you enjoy this extension. Go forth and be productive!</li>
    </ul>
  `;
}
