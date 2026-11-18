import { GamebookContainer } from "../components/gamebook-container";
import type { MsgFn } from "@lit/localize";
import { localizer } from "@webwriter/lit/localize";
import { localizeOptions } from "../model/localization";
import { html, css, nothing } from "lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import type { WebwriterGamebookButton } from "./webwriter-gamebook-button";
import type { WebwriterGamebookBranchButton } from "./webwriter-gamebook-branch-button";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";

/**
 * Represents a popup dialog in the gamebook
 */
@customElement("webwriter-gamebook-popup")
export class WebwriterGamebookPopup extends GamebookContainer {
  protected readonly localize = localizer(this, { ...localizeOptions, drawer: true });
  /** @internal */
  static scopedElements = { "sl-dialog": SlDialog };

  /** @internal */
  static styles = [GamebookContainer.styles, css`
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

    ::slotted(img),
    ::slotted(video) {
      max-width: 100%;
      height: auto;
    }

    @media print {
      .page { padding: 0.5rem 0; }
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

  static options = {
    pageTitle: { type: String, label: (widget: { msg: MsgFn }) => widget.msg("Page title") },
    titleLabel: { type: String, label: (widget: { msg: MsgFn }) => widget.msg("Dialog title") },
    noHeader: { type: Boolean, label: (widget: { msg: MsgFn }) => widget.msg("Hide dialog header") },
  };

  readonly msg = this.localize.msg;

  /** associated node id */
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId: number;

  /** @internal */
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  /** The buttons in the popup */
  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-button, webwriter-gamebook-branch-button",
  })
  accessor buttons: Array<WebwriterGamebookButton | WebwriterGamebookBranchButton>;

  /** The title of the popup */
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle: string;

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

  /** @internal */
  @state() private accessor dialogMounted = false;
  private dialogRequested = false;

  private mutationObserver: MutationObserver;

  constructor() {
    super();
    this.mutationObserver = new MutationObserver(this.mutationCallback);
  }

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

  protected firstUpdated(): void {
    if (this.authoring && !this.firstElementChild && !this.textContent?.trim()) {
      const par = document.createElement("p");
      par.textContent = this.localize.msg("Write something here...");
      this.appendChild(par);
    }

  }

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

          const dispatchEventIfNeeded = (eventName: string, detail: object) => {
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
                | WebwriterGamebookButton
                | WebwriterGamebookBranchButton;
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
      par.textContent = this.localize.msg("Write something here...");
      this.appendChild(par);
    }
  };
}
