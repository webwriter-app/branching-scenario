import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LitElementWw } from "@webwriter/lit";

import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlRange,
  SlIconButton,
  SlCheckbox,
  SlInput,
  SlColorPicker,
} from "@shoelace-style/shoelace";

import alignLeft from "@tabler/icons/outline/align-left.svg";
import alignRight from "@tabler/icons/outline/align-right.svg";
import alignCenter from "@tabler/icons/outline/align-center.svg";

@customElement("webwriter-connection-button")
export class WebWriterConnectionButton extends LitElementWw {
  @property({ type: String, reflect: true }) name: string = "Button";
  @property({ type: Number, reflect: true }) dataTargetId: number;
  @property({ type: String, attribute: true, reflect: true })
  identifier: string;
  @property({ type: String, reflect: true }) size: string = "medium";
  @property({ type: Boolean, reflect: true }) pill: boolean = false;
  @property({ type: Boolean, reflect: true }) outline: boolean = false;
  @property({ type: Number, reflect: true }) width: number = 100;
  @property({ type: String, reflect: true }) alignment: string = "center";
  @property({ type: String, reflect: true }) variant: string = "default";

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-range": SlRange,
      "sl-icon-button": SlIconButton,
      "sl-checkbox": SlCheckbox,
      "sl-input": SlInput,
      "sl-color-picker": SlColorPicker,
    };
  }

  static get styles() {
    return css`
      :host(:not([contenteditable="true"]):not([contenteditable=""]))
        .author-only {
        display: none;
      }

      :host([contenteditable="true"]) .author-only,
      :host([contenteditable=""]) .author-only {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding-left: 10px;
        padding-bottom: 10px;
        gap: 5px;
      }

      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      .controls p {
        padding: 0px;
        margin: 0px;
      }

      .active {
        background-color: #e0e0e0; /* example color for active state */
      }

      .reset-button {
        margin-top: 10px;
        cursor: pointer;
      }
    `;
  }

  firstUpdated() {
    (this.shadowRoot.querySelector("#sizeSelect") as SlSelect).value =
      this.size;
    (this.shadowRoot.querySelector("#pillCheckbox") as SlCheckbox).checked =
      this.pill;
    (this.shadowRoot.querySelector("#outlineCheckbox") as SlCheckbox).checked =
      this.outline;
    (this.shadowRoot.querySelector("#widthRange") as SlRange).value =
      this.width;
    (this.shadowRoot.querySelector("#variantSelect") as SlSelect).value =
      this.variant;
  }

  handleSizeChange(e) {
    this.size = e.target.value;
  }

  handlePillChange(e) {
    this.pill = e.target.checked;
  }

  handleOutlineChange(e) {
    this.outline = e.target.checked;
  }

  handleWidthChange(e) {
    this.width = e.target.value;
  }

  handleVariantChange(e) {
    this.variant = e.target.value;
  }

  handleAlignmentChange(alignment) {
    this.alignment = alignment;
  }

  render() {
    return html`
      <div class="container" style="justify-content: ${this.alignment};">
        <sl-button
          size=${this.size}
          style="
            padding: 0px;
            width: ${this.width}%;
          "
          variant=${this.variant}
          ?pill=${this.pill}
          ?outline=${this.outline}
        >
          <p>${this.name}</p>
        </sl-button>
        <div part="options" class="author-only">
          <p>Title</p>
          <sl-input
            .value=${this.name}
            @input=${(e) => (this.name = e.target.value)}
          ></sl-input>
          <p>Size</p>
          <sl-select id="sizeSelect" @sl-change=${this.handleSizeChange}>
            <sl-option value="small">Small</sl-option>
            <sl-option value="medium">Medium</sl-option>
            <sl-option value="large">Large</sl-option>
          </sl-select>
          <p>Variant</p>
          <sl-select id="variantSelect" @sl-change=${this.handleVariantChange}>
            <sl-option value="default">Default</sl-option>
            <sl-option value="text">Text</sl-option>
            <sl-option value="primary">Primary</sl-option>
            <sl-option value="success">Success</sl-option>
            <sl-option value="neutral">Neutral</sl-option>
            <sl-option value="warning">Warning</sl-option>
            <sl-option value="danger">Danger</sl-option>
          </sl-select>
          <p>Pill</p>
          <sl-checkbox id="pillCheckbox" @sl-change=${this.handlePillChange}>
          </sl-checkbox>
          <p>Outline</p>
          <sl-checkbox
            id="outlineCheckbox"
            @sl-change=${this.handleOutlineChange}
          >
          </sl-checkbox>
          <p>Width</p>
          <label>${this.width}%</label>
          <sl-range
            id="widthRange"
            min="10"
            max="100"
            value=${this.width}
            @input=${this.handleWidthChange}
          ></sl-range>
          <p>Alignment</p>
          <div style="display: flex; gap: 10px;">
            <sl-icon-button
              src=${alignLeft}
              label="Align Left"
              class=${this.alignment === "flex-start" ? "active" : ""}
              @click=${() => this.handleAlignmentChange("flex-start")}
            ></sl-icon-button>
            <sl-icon-button
              src=${alignCenter}
              label="Align Center"
              class=${this.alignment === "center" ? "active" : ""}
              @click=${() => this.handleAlignmentChange("center")}
            ></sl-icon-button>
            <sl-icon-button
              src=${alignRight}
              label="Align Right"
              class=${this.alignment === "flex-end" ? "active" : ""}
              @click=${() => this.handleAlignmentChange("flex-end")}
            ></sl-icon-button>
          </div>
        </div>
      </div>
    `;
  }
}
