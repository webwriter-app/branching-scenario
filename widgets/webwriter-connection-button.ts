import { html, css, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
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
} from "@shoelace-style/shoelace";

import alignLeft from "@tabler/icons/outline/align-left.svg";
import alignRight from "@tabler/icons/outline/align-right.svg";
import alignCenter from "@tabler/icons/outline/align-center.svg";
import { NodeEditor } from "./node-editor";
import { WebWriterGamebookPageContainer } from "./webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./webwriter-gamebook-popup-container";

@customElement("webwriter-connection-button")
export class WebWriterConnectionButton extends LitElementWw {
  @property({ type: Number, reflect: true }) dataTargetId: number;
  @property({ type: String, attribute: true, reflect: true })
  identifier: string;

  @property({ attribute: true }) getNodeEditor = () => {};

  //visual properties
  @property({ type: String, reflect: true }) name: string = "Button";
  @property({ type: String, reflect: true }) size: string = "small";
  @property({ type: Boolean, reflect: true }) pill: boolean = false;
  @property({ type: Boolean, reflect: true }) outline: boolean = false;
  @property({ type: Number, reflect: true }) width: number = 50;
  @property({ type: String, reflect: true }) alignment: string = "center";
  @property({ type: String, reflect: true }) variant: string = "default";

  @query("sl-button")
  button;

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
    };
  }

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

      .reset-button {
        margin-top: 10px;
        cursor: pointer;
      }

      .disabled-hover {
        background-color: initial;
        cursor: not-allowed;
      }

      /* Override hover styles when no-hover class is applied */
      /* sl-button.no-hover::part(base):hover {
        background-color: var(--original-bg-color, initial);
        border-color: var(--original-border-color, initial);
        color: var(--original-color, initial);
        cursor: inherit;
      } */
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

    this.addEventListener("mouseover", () => {
      const parsed = this.parseConnectionIdentifier(this.identifier);
      const event = new CustomEvent("containerHighlightConnectionButton", {
        detail: {
          outputNodeId: parsed.outputNodeId,
          inputNodeId: parsed.inputNodeId,
          outputClass: parsed.outputClass,
          inputClass: "input_1",
          highlightNode: parsed.inputNodeId,
        },
        bubbles: true, // Allows the event to bubble up through the DOM
        composed: true, // Allows the event to pass through shadow DOM boundaries
      });
      this.dispatchEvent(event);
    });

    this.addEventListener("mouseleave", () => {
      const parsed = this.parseConnectionIdentifier(this.identifier);
      const event = new CustomEvent("containerUnhighlightConnectionButton", {
        detail: {
          outputNodeId: parsed.outputNodeId,
          inputNodeId: parsed.inputNodeId,
          outputClass: parsed.outputClass,
          inputClass: "input_1",
          highlightNode: parsed.inputNodeId,
        },
        bubbles: true, // Allows the event to bubble up through the DOM
        composed: true, // Allows the event to pass through shadow DOM boundaries
      });
      this.dispatchEvent(event);
    });
  }

  // queryPartBaseOfSlButton() {
  //   const button = this.shadowRoot?.querySelector("sl-button");

  //   if (button && button.shadowRoot) {
  //     const observer = new MutationObserver((mutationsList, observer) => {
  //       // Check if the part="base" element is present
  //       const partBase = button.shadowRoot?.querySelector(
  //         'button[part="base"]'
  //       );
  //       if (partBase) {
  //         this.updateNoHover();
  //         partBase.addEventListener("transitionend", (event) => {
  //           // Check if the transitioned property is the one you care about
  //           if ((event as TransitionEvent).propertyName !== "width") {
  //             console.log("transitioned");
  //             this.updateNoHover();
  //           }
  //         });

  //         observer.disconnect();
  //       }
  //     });

  //     // Start observing the Shadow DOM for child list changes
  //     observer.observe(button.shadowRoot, { childList: true, subtree: true });
  //   }
  // }

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
            width: ${this.width}%;
          "
          variant=${this.variant}
          ?pill=${this.pill}
          ?outline=${this.outline}
        >
          <p>${this.name}</p>
        </sl-button>

        <div part="options" class="author-only">
          <span>
            <p style="font-weight: 400;">Navigates to</p>
            <sl-button variant="text">
              ${(this.getNodeEditor() as NodeEditor)?.editor.getNodeFromId(
                this.dataTargetId
              ).data.title ?? "Test"}
            </sl-button>
            <p style="font-weight: 400;">in your gamebook.</p>
          </span>
          <sl-divider></sl-divider>
          <div class="item">
            <p>Title</p>
            <sl-input
              size="small"
              .value=${this.name}
              @input=${(e) => (this.name = e.target.value)}
            ></sl-input>
          </div>
          <div class="item">
            <p>Size</p>
            <sl-select
              size="small"
              id="sizeSelect"
              @sl-change=${this.handleSizeChange}
            >
              <sl-option value="small">Small</sl-option>
              <sl-option value="medium">Medium</sl-option>
              <sl-option value="large">Large</sl-option>
            </sl-select>
          </div>
          <div class="item">
            <p>Variant</p>
            <sl-select
              size="small"
              id="variantSelect"
              @sl-change=${this.handleVariantChange}
            >
              <sl-option value="default">Default</sl-option>
              <sl-option value="text">Text</sl-option>
              <sl-option value="primary">Primary</sl-option>
              <sl-option value="success">Success</sl-option>
              <sl-option value="neutral">Neutral</sl-option>
              <sl-option value="warning">Warning</sl-option>
              <sl-option value="danger">Danger</sl-option>
            </sl-select>
          </div>
          <div
            style="display: flex; gap: 5px; align-items: center; justify-content: flex-start;"
          >
            <p style="margin-right: auto;">Pill</p>
            <sl-checkbox id="pillCheckbox" @sl-change=${this.handlePillChange}>
            </sl-checkbox>
          </div>
          <div
            style="display: flex; gap: 5px; align-items: center; justify-content: flex-start;"
          >
            <p style="margin-right: auto;">Outline</p>
            <sl-checkbox
              id="outlineCheckbox"
              @sl-change=${this.handleOutlineChange}
            >
            </sl-checkbox>
          </div>
          <div class="item">
            <div
              style="display: flex; gap: 5px; align-items: center; justify-content: flex-start; padding: 0px; margin: 0px;"
            >
              <p style="margin-right: auto;">Width</p>
              <p style="font-weight: 300;">${this.width}%</p>
            </div>
            <sl-range
              size="small"
              id="widthRange"
              min="10"
              max="100"
              tooltip="none"
              value=${this.width}
              @input=${this.handleWidthChange}
              style="--thumb-size: 17px;"
            ></sl-range>
          </div>
          <div
            style="display: flex; gap: 5px; align-items: center; justify-content: flex-start; padding: 0px; margin: 0px;"
          >
            <p style="margin-right: auto;">Alignment</p>
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

  // private updateNoHover() {
  //   const button = this.shadowRoot?.querySelector("sl-button");
  //   if (button) {
  //     const partBase = button.shadowRoot?.querySelector('button[part="base"]');
  //     if (partBase) {
  //       console.log("inside");
  //       const computedStyles = getComputedStyle(partBase);

  //       console.log(computedStyles.backgroundColor);

  //       button.style.setProperty(
  //         "--original-bg-color",
  //         computedStyles.backgroundColor
  //       );
  //       button.style.setProperty(
  //         "--original-border-color",
  //         computedStyles.borderColor
  //       );
  //       button.style.setProperty("--original-color", computedStyles.color);
  //     }
  //   }
  // }
}
