import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
  queryAll,
} from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook-model";

import { LinkButton } from "./link-button";

//Shoelace
import { SlButton, SlDialog, SlIconButton } from "@shoelace-style/shoelace";

//CSS
import styles from "../css/quiz-container-css";

//Bootstrap Icon Import
import arrowRight from "@tabler/icons/outline/arrow-right.svg";

@customElement("quiz-container")
export class QuizContainer extends LitElementWw {
  //import CSS
  static styles = [styles];

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-dialog": SlDialog,
      "sl-icon-button": SlIconButton,
    };
  }

  @property({ type: Number, attribute: true, reflect: true }) drawflowNodeId =
    null;

  @property({ type: String, attribute: true, reflect: true }) quiz?;

  @queryAll("sl-button") answerButtons;

  @query(".dialog") dialog: SlDialog;

  // Query the slot element
  @query("slot") slot;

  protected firstUpdated(_changedProperties: any): void {
    // Prevent the dialog from closing when the user clicks on the overlay
    this.dialog.addEventListener("sl-request-close", (event) => {
      if (event.detail.source === "overlay") {
        event.preventDefault();
      }
    });
  }

  render() {
    return html`
      <div class="quiz">
        <sl-dialog
          label="Quiz"
          class="dialog"
          id="dialog"
          style="--width: 50vw;"
          no-header
        >
          <div class="content">
            <p style="margin: 0px; padding-bottom: 10px;">
              ${JSON.parse(this.quiz).question}
            </p>
            ${JSON.parse(this.quiz).answers.map(
              (answer) =>
                html`<sl-button
                  pageTargetId="${(answer as Answer).targetPageId}"
                >
                  ${(answer as Answer).text}
                  <sl-icon slot="suffix" src=${arrowRight}></sl-icon>
                </sl-button>`
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
