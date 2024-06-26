import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook-model";

import { LinkButton } from "./link-button";

//Shoelace
import { SlButton, SlDialog } from "@shoelace-style/shoelace";

//CSS
import styles from "../css/quiz-container-css";

@customElement("quiz-container")
export class QuizContainer extends LitElementWw {
  //import CSS
  static styles = [styles];

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-dialog": SlDialog,
    };
  }

  @property({ type: Number, attribute: true, reflect: true }) drawflowNodeId =
    null;

  @query(".dialog") dialog: SlDialog;

  // Query the slot element
  @query("slot") slot;

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: any): void {
    // Ensure the dialog element is available
    console.log(this.dialog); // Check if the dialog is defined
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    // Check if the dialog element is ready after update
    console.log(this.dialog); // Ensure the dialog element is accessible
  }

  render() {
    return html`
      <sl-dialog
        label="Dialog"
        class="dialog"
        id="dialog"
        style="--width: 50vw;"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <slot></slot>
      </sl-dialog>
    `;
  }

  hide() {
    if (this.dialog) {
      this.dialog.hide();
    }
  }

  show() {
    if (this.dialog) {
      this.dialog.show();
    }
  }
}
