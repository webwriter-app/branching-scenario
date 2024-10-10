import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIconButton } from "@shoelace-style/shoelace";

//Tabler Icon Import
import pencil from "@tabler/icons/outline/pencil.svg";
import check from "@tabler/icons/outline/check.svg";
import x from "@tabler/icons/outline/x.svg";

@customElement("toggle-text-input")
export class ToggleTextInput extends LitElementWw {
  @state() accessor isEditable: Boolean = false;

  @state() accessor hasError: Boolean = false;

  @property({ type: String, attribute: true }) accessor text = "";
  @property({ type: Function }) accessor saveChanges = (string) => {};

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-icon-button": SlIconButton,
    };
  }

  static get styles() {
    return css`
      .horizontal {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        width: 260px;
      }

      input {
        font-weight: bold;
        color: #3f3f46;
        margin: 0;
        padding: 0;
        border: none;
        border-bottom: 1px solid #d4d4d8;
        width: 180px;
        box-sizing: border-box;
      }

      input.error {
        border-bottom: 1px solid red;
      }

      p {
        font-size: 16px;
        font-weight: bold;
        color: #3f3f46;
        margin: 0;
        padding: 0;
        max-width: 180px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .error-message {
        color: red;
        font-size: 12px;
        margin-top: 4px;
      }
    `;
  }

  render() {
    return html`
      <div class="horizontal">
        ${this.isEditable
          ? html`
              <input
                id="pageNameInput"
                placeholder="Enter title"
                style="margin-right: 8px;"
                value=${this.text}
                class=${this.hasError ? "error" : ""}
              />
              <sl-icon-button
                id="cancelButton"
                src=${x}
                style="font-size: 18px;"
                @click=${() => this.toggleRename()}
              ></sl-icon-button>
              <sl-icon-button
                id="saveButton"
                src=${check}
                style="font-size: 18px;"
                @click="${() => this.save()}"
              ></sl-icon-button>
            `
          : html`
              <p>${this.text}</p>
              <sl-icon-button
                id="renameToggleButton"
                src=${pencil}
                style="font-size: 18px;"
                @click=${() => this.toggleRename()}
              ></sl-icon-button>
            `}
      </div>
      ${this.hasError
        ? html`<div class="error-message">The title cannot be empty</div>`
        : ""}
    `;
  }

  private toggleRename() {
    this.isEditable = !this.isEditable;
    this.hasError = false; // Reset error state when toggling
  }

  private save() {
    const input = this.shadowRoot.querySelector(
      "#pageNameInput"
    ) as HTMLInputElement;
    if (this.validate(input.value)) {
      this.isEditable = false;
      this.hasError = false;
      this.saveChanges(input.value);
    } else {
      this.hasError = true;
    }
  }

  private validate(value: string): boolean {
    return value.trim() !== "";
  }
}
