import { GamebookContainer } from "../../utils/gamebook-container";
import { localizeElement } from "../../utils/localization";
import { html, css, nothing } from "lit";
import {
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import { WebWriterGamebookButton } from "../webwriter-gamebook-button/webwriter-gamebook-button.component";
import { WebWriterGamebookBranchButton } from "../webwriter-gamebook-branch-button/webwriter-gamebook-branch-button.component";

//Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";

/**
 * Represents a popup dialog in the gamebook
 */
export class WebWriterGamebookPopup extends GamebookContainer {
  protected readonly messages = localizeElement(this);
  private getDrawerOptions() {
    return {
      pageTitle: {type: String, label: {_: this.messages.msg("Page title")}},
      titleLabel: {type: String, label: {_: this.messages.msg("Dialog title")}},
      noHeader: {type: Boolean, label: {_: this.messages.msg("Hide dialog header")}},
    };
  }

  /**
   * import CSS
   * @internal
   */
  static get styles() {
    return [GamebookContainer.styles, css`
      .page {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        padding: 20px;
      }

      sl-dialog .page {
        padding: 0;
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
    `];
  }

  /**
   * registering custom elements used in the widget
   * @internal
   */
  static get scopedElements() {
    return {
      "sl-dialog": SlDialog,
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
  accessor slotContent: Array<HTMLElement>;

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
    Object.defineProperty(this, "options", { configurable: true, get: () => this.getDrawerOptions() });
    this.mutationObserver = new MutationObserver(this.mutationCallback);
  }

  /* 
  
  */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeydown, true);
    this.mutationObserver.observe(this, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });

  }

  /*

  */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.dialogRequested = false;
    if (this.dialog) this.dialog.open = false;
    this.mutationObserver.disconnect();
    this.removeEventListener("keydown", this._handleKeydown, true);
  }

  /*
   * Handles CTRL+A to select all content within the page instead of the whole widget
   */
  private _handleKeydown = (event: KeyboardEvent) => {
    if (this.authoring && (event.metaKey || event.ctrlKey) && event.key === "a") {
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
    if (this.authoring && !this.firstElementChild && !this.textContent?.trim()) {
      const par = document.createElement("p");
      par.textContent = this.messages.msg("Write something here...");
      this.appendChild(par);
    }

  }

  @state() private accessor dialogMounted = false;
  private dialogRequested = false;

  render() {
    if (this.authoring) return html`<slot class="page"></slot>`;
    if (!this.dialogMounted) return nothing;
    return html`
      <sl-dialog
        id="dialog"
        class=${this.preventClosing ? "hide-close-button" : ""}
        style="--width: 100%"
        label=${this.titleLabel}
        ?no-header=${this.noHeader}
        @sl-request-close=${this.handleCloseRequest}
        @sl-hide=${this.handleDialogHide}
      ><slot class="page"></slot></sl-dialog>
    `;
  }

  private handleCloseRequest(event: Event) {
    if (this.preventClosing && event.target === this.dialog) event.preventDefault();
  }

  private handleDialogHide(event: Event) {
    if (event.target === this.dialog) this.hide();
  }

  public show() {
    if (this.authoring) this.requestUpdate();
    super.show();
  }

  public hideDialog() {
    this.dialogRequested = false;
    void this.dialog?.hide();
    this.hide();
  }

  public async showDialog() {
    this.dialogRequested = true;
    this.dialogMounted = true;
    this.requestUpdate();
    await this.updateComplete;
    const dialog = this.dialog;
    await dialog?.updateComplete;
    if (!this.dialogRequested || !this.isConnected || !dialog?.isConnected) return;
    this.show();
    void dialog.show();
  }

  private mutationCallback = (mutationList: MutationRecord[]) => {
    if (!this.authoring) return;
    mutationList.forEach(({ type, removedNodes, attributeName, target }) => {
      if (type === "childList") {
        removedNodes.forEach((node) => {
          const element = node as HTMLElement;
          if (this.contains(element)) return;
          const nodeName = element.nodeName.toLowerCase();

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
      } else if (type === "attributes" && attributeName === "class" && target === this) {
        if (this.classList.contains("ProseMirror-selectednode")) {
          const event = new CustomEvent("nodeWwSelected", {
            detail: { nodeId: this.drawflowNodeId },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        }
      }
    });

    if (mutationList.some(record => record.type === "childList" && record.removedNodes.length)
      && !this.firstElementChild && !this.textContent?.trim()) {
      const par = document.createElement("p");
      par.textContent = this.messages.msg("Write something here...");
      this.appendChild(par);
    }
  };
}
