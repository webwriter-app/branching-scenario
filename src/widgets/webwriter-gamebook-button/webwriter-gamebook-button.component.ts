import { buttonOptions } from "../../utils/button-options";
import { html, css } from "lit";
import { property, query } from "lit/decorators.js";
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
  SlDivider,
  SlButtonGroup,
  SlIcon,
} from "@shoelace-style/shoelace";

import alignLeft from "@tabler/icons/outline/align-left.svg";
import alignRight from "@tabler/icons/outline/align-right.svg";
import alignCenter from "@tabler/icons/outline/align-center.svg";

/**
 * Represents a button that branches to another part of the gamebook.
 */
export class WebWriterGamebookButton extends LitElementWw {
  readonly options = buttonOptions;


  /** The identifier of the target node */
  @property({ type: Number, reflect: true }) accessor dataTargetId: number;
  /** The identifier of the connection */
  @property({ type: String, attribute: true, reflect: true })
  accessor identifier: string;

  /** @internal */
  @property({ attribute: true }) accessor getNodeEditor = () => {};

  // visual properties

  /** Button text */
  @property({ type: String, reflect: true }) accessor name: string = "Button";
  /** Button size: small, medium, large */
  @property({ type: String, reflect: true }) accessor size: string = "small";
  /** Button pill style */
  @property({ type: Boolean, reflect: true }) accessor pill: boolean = false;
  /** Button outline style */
  @property({ type: Boolean, reflect: true }) accessor outline: boolean = false;
  /** Button width percentage */
  @property({ type: Number, reflect: true }) accessor width: number = 50;
  /** Button alignment: flex-start, center, flex-end */
  @property({ type: String, reflect: true }) accessor alignment: string =
    "center";
  /** Button variant: default, text, primary, success, neutral, warning, danger */
  @property({ type: String, reflect: true }) accessor variant: string =
    "default";
  /** @internal */
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  /** @internal */
  @query("sl-button") accessor button;

  /** @internal */
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
      "sl-divider": SlDivider,
      "sl-button-group": SlButtonGroup,
      "sl-icon": SlIcon,
    };
  }

  /** @internal */
  static get styles() {
    return css`
      :host(.highlighted) {
        border: 1px dashed #38bdf8;
        -webkit-box-shadow: 0 4px 30px 4px #c0c0c0;
        box-shadow: 0 4px 30px 4px #c0c0c0;
      }

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
        gap: 12px;
      }

      .author-only .item {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding-bottom: 10px;
      }

      .author-only p {
        margin: 0px;
        font-weight: 500;
        font-size: 15px;
        box-sizing: border-box;

        /* border-bottom: 1.5px solid #52525b; */
        color: #52525b;
      }

      .container {
        display: flex;
        width: 100%;
      }

      .controls p {
        padding: 0px;
        margin: 0px;
      }

      .active {
        background-color: #e0e0e0; /* example color for active state */
      }

      sl-button.active::part(base) {
        background-color: #efefef; /* example color for active state */
      }
    `;
  }

  firstUpdated() {
    this.addEventListener("mouseover", () => {
      const parsed = this.parseConnectionIdentifier(this.identifier);
      const event = new CustomEvent("hoverButton", {
        detail: {
          outputNodeId: parsed.outputNodeId,
          inputNodeId: parsed.inputNodeId,
          outputClass: parsed.outputClass,
          inputClass: "input_1",
          highlightButton: false,
        },
        bubbles: true, // Allows the event to bubble up through the DOM
        composed: true, // Allows the event to pass through shadow DOM boundaries
      });
      this.dispatchEvent(event);
    });

    this.addEventListener("mouseleave", () => {
      const parsed = this.parseConnectionIdentifier(this.identifier);
      const event = new CustomEvent("leaveButton", {
        detail: {
          outputNodeId: parsed.outputNodeId,
          inputNodeId: parsed.inputNodeId,
          outputClass: parsed.outputClass,
          inputClass: "input_1",
          highlightButton: false,
        },
        bubbles: true, // Allows the event to bubble up through the DOM
        composed: true, // Allows the event to pass through shadow DOM boundaries
      });
      this.dispatchEvent(event);
    });
  }

  render() {
    return html`
      <div class="container" style="justify-content: ${this.alignment};">
        <sl-button
          size=${this.size}
          style="
            width: ${this.width}%;
            pointer-events: ${this.isContentEditable ? "none" : "auto"}
          "
          variant=${this.variant}
          ?pill=${this.pill}
          ?outline=${this.outline}
        >
          <p>${this.name}</p>
        </sl-button>

      </div>
    `;
  }

  /*

  */
  private parseConnectionIdentifier(identifier) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      outputClass: parts[1],
      inputNodeId: parseInt(parts[2]),
      inputClass: parts[3],
    };

    return parsed;
  }
}
