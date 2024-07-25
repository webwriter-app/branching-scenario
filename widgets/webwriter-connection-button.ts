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

@customElement("webwriter-connection-button")
export class WebWriterConnectionButton extends LitElementWw {
  @property({ type: String }) name: string;
  @property({ type: Number }) dataTargetId: number;
  @property({ type: String, attribute: true })
  identifier: string;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
    };
  }

  static get styles() {
    return css`
      :host(:not([contenteditable="true"]):not([contenteditable=""]))
        .author-only {
        display: none;
      }

      .controls {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border: 1px solid orange;
        padding-left: 10px;
        padding-bottom: 10px;
        gap: 5px;
      }

      .controls p {
        padding: 0px;
        margin: 0px;
      }
    `;
  }

  //TODO: Copy and Paste and stuff does not make sense if the editor does not react
  //TODO: Focus is messed up, when clicking on the input, the focus shifts away from the button
  render() {
    return html`
      <div style="width: 100%">
        <sl-button size="medium" style="padding: 0px; width: 100%;">
          <p>${this.name}</p>
        </sl-button>
        <div part="options" class="controls">
          <p>Title</p>
          <input
            class="author-only"
            .value=${this.name}
            @change=${(e) => (this.name = e.target.value)}
          />
          <p>Style</p>
          <sl-select>
            <sl-option value="option-1">Option 1</sl-option>
            <sl-option value="option-2">Option 2</sl-option>
            <sl-option value="option-3">Option 3</sl-option>
            <sl-option value="option-4">Option 4</sl-option>
            <sl-option value="option-5">Option 5</sl-option>
            <sl-option value="option-6">Option 6</sl-option>
          </sl-select>
        </div>
      </div>
    `;
  }
}
