import { localizeElement, LocalizedElement } from "../../utils/localization";
import { buttonOptions } from "../../utils/button-options";
import { html, css } from "lit";
import { property, query } from "lit/decorators.js";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";

/**
 * Represents a button that branches to another part of the gamebook.
 */
export class WebWriterGamebookButton extends LocalizedElement {
  private readonly messages = localizeElement(this);
  constructor() {
    super();
    Object.defineProperty(this, "options", { configurable: true, get: () => this.getDrawerOptions() });
  }

  private getDrawerOptions() { return buttonOptions(this.messages.msg); }


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
  static scopedElements = { "sl-button": SlButton };

  /** @internal */
  static get styles() {
    return css`
      :host(.highlighted) {
        border: 1px dashed #38bdf8;
        -webkit-box-shadow: 0 4px 30px 4px #c0c0c0;
        box-shadow: 0 4px 30px 4px #c0c0c0;
      }

      :host([contenteditable="true"]) sl-button,
      :host([contenteditable=""]) sl-button {
        pointer-events: var(--gamebook-choice-pointer-events, none);
      }

      :host {
        display: flex;
        flex-direction: column;
      }

      .label {
        display: block;
        margin-block: 1em;
      }
    `;
  }

  firstUpdated() {
    this.addEventListener("mouseover", () => {
      if (!this.identifier || !this.isContentEditable || this.closest<HTMLElement>("webwriter-branching-scenario")?.isContentEditable === false) return;
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
      if (!this.identifier || !this.isContentEditable || this.closest<HTMLElement>("webwriter-branching-scenario")?.isContentEditable === false) return;
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
      <sl-button
        size=${this.size}
        style="width: ${this.width}%; align-self: ${this.alignment};"
        variant=${this.variant}
        ?pill=${this.pill}
        ?outline=${this.outline}
      ><span class="label">${this.name}</span></sl-button>
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
