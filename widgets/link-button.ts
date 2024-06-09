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
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";

@customElement("link-button")
export class LinkButton extends LitElementWw {
  @property({ type: String }) name: string;
  @property({ type: Number }) dataTargetId: number;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
    };
  }

  render() {
    return html`
      <div>
        <sl-button>Link to ${this.name}</sl-button>
      </div>
    `;
  }
}
