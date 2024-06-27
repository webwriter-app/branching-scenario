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

  @property({ type: String, attribute: true, reflect: true }) quiz?;

  @query(".dialog") dialog: SlDialog;

  // Query the slot element
  @query("slot") slot;

  render() {
    return html`
      <div class="test">
        <sl-dialog
          label="Quiz"
          class="dialog"
          id="dialog"
          style="--width: 50vw;"
        >
          <p>${JSON.parse(this.quiz).question}</p>
          <div>
            ${JSON.parse(this.quiz).answers.map(
              (answer) =>
                html`<sl-button>${(answer as Answer).text}</sl-button>`
            )}
          </div>
        </sl-dialog>
      </div>
    `;
  }

  hide() {
    this.style.display = "none";
    if (this.dialog) {
      this.dialog.hide();
    }
  }

  show() {
    this.style.display = "block";
    if (this.dialog) {
      this.dialog.show();
    }
  }
}

// <div>
//           ${this.quizObject.data.answers.map(
//             (answer) => html`<sl-button>${(answer as Answer).text}</sl-button>`
//           )}
//         </div>
