import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LitElementWw } from "@webwriter/lit";

import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlRange,
} from "@shoelace-style/shoelace";

@customElement("webwriter-connection-button")
export class WebWriterConnectionButton extends LitElementWw {
  @property({ type: String }) name: string = "Button";
  @property({ type: Number }) dataTargetId: number;
  @property({ type: String, attribute: true }) identifier: string;
  @state() variant: string = "default";
  @state() size: string = "medium";
  @state() pill: boolean = false;
  @state() width: number = 100;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-range": SlRange,
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

  handleVariantChange(e) {
    this.variant = e.target.value;
  }

  handleSizeChange(e) {
    this.size = e.target.value;
  }

  handlePillChange(e) {
    this.pill = e.target.checked;
  }

  handleWidthChange(e) {
    this.width = e.target.value;
  }

  render() {
    return html`
      <div style="width: 100%">
        <sl-button
          size=${this.size}
          style="padding: 0px; width: ${this.width}%;"
          variant=${this.variant}
          ?pill=${this.pill}
        >
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
          <sl-select @sl-change=${this.handleVariantChange}>
            <sl-option value="default">Default</sl-option>
            <sl-option value="primary">Primary</sl-option>
            <sl-option value="success">Success</sl-option>
            <sl-option value="neutral">Neutral</sl-option>
            <sl-option value="warning">Warning</sl-option>
            <sl-option value="danger">Danger</sl-option>
          </sl-select>
          <p>Size</p>
          <sl-select @sl-change=${this.handleSizeChange}>
            <sl-option value="small">Small</sl-option>
            <sl-option value="medium">Medium</sl-option>
            <sl-option value="large">Large</sl-option>
          </sl-select>
          <p>Pill</p>
          <input
            type="checkbox"
            .checked=${this.pill}
            @change=${this.handlePillChange}
          />
          <p>Width</p>
          <sl-range
            min="10"
            max="100"
            value=${this.width}
            @input=${this.handleWidthChange}
          ></sl-range>
        </div>
      </div>
    `;
  }
}
