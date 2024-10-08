import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { DrawflowNode } from "drawflow";

import { WebWriterConnectionButton } from "./webwriter-connection-button";
import { WebWriterSmartBranchButton } from "./webwriter-smart-branch-button";

//Shoelace
import { SlButton, SlDialog } from "@shoelace-style/shoelace";
import { WebWriterGamebookOptions } from "../webwriter-gamebook-options";

@customElement("webwriter-gamebook-popup-container")
export class WebWriterGamebookPopupContainer extends LitElementWw {
  //import CSS
  static get styles() {
    return css`
      :host(:not([contenteditable="true"]):not([contenteditable=""])) .page {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px; /* Adjust the value to your desired spacing */
        box-sizing: border-box;
        width: 100%;
        height: auto;
        padding: 0px;
      }

      :host([contenteditable="true"]) .page,
      :host([contenteditable=""]) .page {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px; /* Adjust the value to your desired spacing */
        box-sizing: border-box;
        width: 100%;
        height: auto;
        padding: 20px;
      }

      :host(:not([contenteditable="true"]):not([contenteditable=""]))
        .author-only {
        display: none;
      }

      /* Base style for the close button visibility */
      sl-dialog::part(close-button) {
        display: var(--close-button-display, flex);
      }

      /* Hide the close button when the class is applied */
      .hide-close-button {
        --close-button-display: none;
      }

      sl-dialog::part(base) {
        position: absolute;
      }

      sl-dialog::part(overlay) {
        position: absolute;
      }
    `;
  }

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-dialog": SlDialog,
      "webwriter-connection-button": WebWriterConnectionButton,
      "webwriter-gamebook-options": WebWriterGamebookOptions,
    };
  }
  //associated node id
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId;

  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-connection-button, webwriter-smart-branch-button",
  })
  accessor buttons;

  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle;

  @queryAssignedElements({
    flatten: true,
  })
  accessor slotContent;

  @query("#dialog") accessor dialog: SlDialog;

  @property({ type: String, attribute: true, reflect: true })
  accessor titleLabel = "Dialog";
  @property({ type: Boolean, attribute: true, reflect: true })
  accessor noHeader = false;
  @property({ type: Boolean, attribute: true, reflect: true })
  accessor preventClosing;
  @property({ type: Number, attribute: true, reflect: true })
  accessor branchesOff = -1;

  // Create an observer instance linked to the callback function
  private mutationObserver: MutationObserver;

  /* 
  
  
  */
  constructor() {
    super();
    this.mutationObserver = new MutationObserver(this.mutationCallback);
  }

  /* 
  
  
  */
  protected firstUpdated(_changedProperties: any): void {
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    this.mutationObserver.observe(this, config);

    const slot = this.shadowRoot.querySelector("slot");
    const assignedElements = slot.assignedElements();

    if (assignedElements.length == 0) {
      const par = document.createElement("p");
      this.appendChild(par);
    }

    if (this.preventClosing && this.dialog) {
      // Prevent the dialog from closing when the user clicks on the overlay
      this.dialog.addEventListener("sl-request-close", (event) => {
        if (
          event.detail.source === "overlay" ||
          event.detail.source === "close-button" ||
          event.detail.source === "keyboard"
        ) {
          event.preventDefault();
        }
      });

      this.dialog.classList.add("hide-close-button");
    }
  }

  /*


  */
  render() {
    return html` ${this.isContentEditable
      ? html`
          <slot class="page"></slot>
          <webwriter-gamebook-options
            class="author-only"
            part="options"
          ></webwriter-gamebook-options>
        `
      : html`
          <sl-dialog
            id="dialog"
            style="--width: 100%;"
            label=${this.titleLabel}
            ?no-header=${this.noHeader ? true : false}
            ><slot class="page"></slot
          ></sl-dialog>
        `}`;
  }

  /*


  */
  public hide() {
    this.style.display = "none";
  }

  /*


  */
  public show() {
    this.style.display = "block";
  }

  /*


  */
  public hideDialog() {
    this.dialog.hide();
    this.style.display = "none";
  }

  /*


*/
  public showDialog() {
    this.style.display = "block";
    this.dialog.show();
  }

  /*


  */
  private mutationCallback = (mutationList: MutationRecord[]) => {
    mutationList.forEach(({ type, removedNodes }) => {
      if (type === "childList") {
        removedNodes.forEach((node) => {
          const element = node as HTMLElement;
          const nodeName = element.nodeName.toLowerCase();

          const isSelectedNode = element.classList?.contains(
            "ProseMirror-selectednode"
          );

          const dispatchEventIfNeeded = (eventName: string, detail: any) => {
            const event = new CustomEvent(eventName, {
              detail,
              bubbles: true,
              composed: true,
            });
            this.dispatchEvent(event);
          };

          if (element.classList?.contains("ww-widget")) {
            if (
              nodeName === "webwriter-connection-button" ||
              nodeName === "webwriter-smart-branch-button"
            ) {
              const connButton = node as
                | WebWriterConnectionButton
                | WebWriterSmartBranchButton;
              if (connButton.identifier !== "x") {
                dispatchEventIfNeeded("buttonDeleted", {
                  identifier: connButton.identifier,
                });
              }
            } else if (
              nodeName === "webwriter-quiz" ||
              nodeName === "webwriter-task"
            ) {
              if (this.branchesOff !== -1) {
                dispatchEventIfNeeded("quizElementDeleted", {
                  containerId: this.branchesOff,
                  id: element.id,
                  isQuiz: nodeName === "webwriter-quiz",
                });
              }
            }
          }
        });
      }
    });
  };
}
