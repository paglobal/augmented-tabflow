import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

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
        It assumes a workflow that is mostly central to one open chrome window
        at a time. If you prefer working with multiple chrome windows, this is
        probably not the right extension for you (I would at least give it a try
        first though).
      </li>
      <li>
        It's is centered around tab groups. It's going to be most beneficial to
        you if you make heavy use of tab groups.
      </li>
      <li>
        By design, only two forms of sorting are allowed: alphabetical sorting
        and sorting by date. No custom sorting is permitted. This is maintain
        simplicity in the design of the extension and allow the easy
        implementation of certain features. I personally find that it removes
        that mental burden associated with sorted and makes me more efficient as
        well, but that may not be your cup of tea (you could still give it a try
        first though).
      </li>
    </ul>
  `;
}
