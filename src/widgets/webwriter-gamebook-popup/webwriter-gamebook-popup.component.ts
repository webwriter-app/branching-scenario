import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  property,
  query,
  queryAssignedElements,
} from "lit/decorators.js";

import { msg, localized } from "@lit/localize";
import { WebWriterGamebookButton } from "../webwriter-gamebook-button/webwriter-gamebook-button.component";
import { WebWriterGamebookBranchButton } from "../webwriter-gamebook-branch-button/webwriter-gamebook-branch-button.component";
import { WebWriterGamebookOptions } from "../../components/options-panel/webwriter-gamebook-options";

//Shoelace
import { SlDialog } from "@shoelace-style/shoelace";

/**
 * Represents a popup dialog in the gamebook
 */
@localized()
export class WebWriterGamebookPopup extends LitElementWw {
  /**
   * import CSS
   * @internal
   */
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
        position: absolute; /* Make the overlay absolute */
      }

      sl-dialog::part(overlay) {
        position: absolute; /* Make the overlay absolute */
        background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
      }
    `;
  }

  /**
   * registering custom elements used in the widget
   * @internal
   */
  static get scopedElements() {
    return {
      "sl-dialog": SlDialog,
      //"webwriter-gamebook-button": WebWriterGamebookButton,
      "webwriter-gamebook-options": WebWriterGamebookOptions,
    };
  }
  /** associated node id */
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId;

  /** @internal */
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  /** The buttons in the popup */
  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-button, webwriter-gamebook-branch-button",
  })
  accessor buttons;

  /** The title of the popup */
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle;

  /** The content of the popup */
  @queryAssignedElements({
    flatten: true,
  })
  accessor slotContent;

  /** The Shoelace dialog element */
  @query("#dialog") accessor dialog: SlDialog;

  /** The title label of the dialog */
  @property({ type: String, attribute: true, reflect: true })
  accessor titleLabel = "Dialog";
  /** Whether the header should be disabled */
  @property({ type: Boolean, attribute: true, reflect: true })
  accessor noHeader = false;
  /** Whether closing the dialog should be prevented */
  @property({ type: Boolean, attribute: true, reflect: true })
  accessor preventClosing = true;
  /** The id of the branch connected to the page */
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
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeydown, true);
  }

  /*

  */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
  }

  /*
   * Handles CTRL+A to select all content within the page instead of the whole widget
   */
  private _handleKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "a") {
      event.preventDefault();
      event.stopPropagation();

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

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
      par.textContent = msg("Write something here...");
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

  /**
   * Enables the popup
   */
  public show() {
    this.style.display = "block";
  }

  /**
   * Hides the popup
   */
  public hideDialog() {
    this.dialog.hide();
    this.style.display = "none";
  }

  /**
   * Shows the popup
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
              nodeName === "webwriter-gamebook-button" ||
              nodeName === "webwriter-gamebook-branch-button"
            ) {
              const connButton = node as
                | WebWriterGamebookButton
                | WebWriterGamebookBranchButton;
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

    // Check if there is at least one paragraph <p> element in the container
    const paragraphs = this.querySelectorAll("p");
    if (paragraphs.length === 0) {
      const par = document.createElement("p");
      par.textContent = msg("Write something here...");
      this.appendChild(par);
    }
  };
}
