import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { rootBookmarkNodeTitle } from "../constants";

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
      <li>It is centered around tab groups.</li>
      <li>
        It allows you to save your sessions as bookmarks that are automatically
        updated anytime you make a change to your current active session
        (provided it has been saved).
      </li>
      <li>
        Sessions normally consist of all tabs from all "normal" windows (no
        popups, PWAs, etc).
      </li>
      <li>
        Your sessions are saved in the bookmark folder
        "${rootBookmarkNodeTitle}" but you can change the title if you wish. Be
        careful of how you and other extensions modify this folder.
      </li>
      <li>
        Please don't modify any session's bookmark folder while that session is
        active.
      </li>
      <li>
        There are many buttons in the UI that allow you to perform many
        functions. Hover over any of them to find out what they do.
      </li>
      <li>The rest is pretty intuitive. You'll figure it out.</li>
      <li>I hope you enjoy this extension. Go forth and be productive!</li>
    </ul>
  `;
}
