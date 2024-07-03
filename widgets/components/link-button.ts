import { html, css, LitElement, unsafeCSS } from "lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { LitElementWw } from "@webwriter/lit";

import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlOption, SlSelect, SlButton } from "@shoelace-style/shoelace";

@customElement("link-button")
export class LinkButton extends LitElementWw {
  @property({ type: String }) name: string;
  @property({ type: Number }) dataTargetId: number;
  @property({ type: String }) identifier: string;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
    };
  }

  //TODO: Focus is messed up, when clicking on the input, the focus shifts away from the button
  render() {
    return html`
      <div>
        <sl-button size="medium" style="padding: 0px;">
          <p>${this.name}</p>
        </sl-button>
        <input
          part="options"
          .value=${this.name}
          @change=${(e) => (this.name = e.target.value)}
        />
      </div>
    `;
  }
}
