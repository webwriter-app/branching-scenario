import { GamebookContainer } from "../components/gamebook-container";
import type { MsgFn } from "@lit/localize";
import { localizer } from "@webwriter/lit/localize";
import { localizeOptions } from "../model/localization";
import { html, css } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
} from "lit/decorators.js";

import type { WebwriterGamebookButton } from "./webwriter-gamebook-button";

import type { WebwriterGamebookBranchButton } from "./webwriter-gamebook-branch-button";

import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../components/gamebook-editor-state-context";

/**
 * Represents a page of the gamebook
 */
@customElement("webwriter-gamebook-page")
export class WebwriterGamebookPage extends GamebookContainer {
  protected readonly localize = localizer(this, { ...localizeOptions, drawer: true });
  /** @internal */
  static styles = [GamebookContainer.styles, css`
    .page {
      display: flex;
      flex-direction: column;
      gap: 10px; /* Adjust the value to your desired spacing */
      padding: 20px;
      box-sizing: border-box;
      width: 100%;
      min-height: 400px;
      height: 100%;
    }

    :host(:not([contenteditable="true"]):not([contenteditable=""]))
      .author-only {
      display: none;
    }

    ::slotted(img),
    ::slotted(video) {
      max-width: 100%;
      height: auto;
    }

    @container (max-width: 480px) {
      .page { padding: 12px; }
    }

    @media print {
      .page {
        min-height: 0;
        padding: 0.5rem 0;
      }
    }
  `];

  static options = {
    pageTitle: { type: String, label: (widget: { msg: MsgFn }) => widget.msg("Page title") },
  };

  readonly msg = this.localize.msg;


  /** The state of the editor in a stringified JSON format */
  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  /** @internal */
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  /** Associated node id */
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId: number;
  /** The title of the page */
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle: string;
  /** The origin page number */
  @property({ type: Number, attribute: true, reflect: true })
  accessor originPage: number;
  /** The id of the branch connected to the page */
  @property({ type: Number, attribute: true, reflect: true })
  accessor branchesOff = -1;

  /** @internal */
  @query("slot") accessor slotElement: HTMLSlotElement;

  /** The gamebook buttons on the page */
  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-button, webwriter-gamebook-branch-button",
  })
  accessor buttons: Array<WebwriterGamebookButton | WebwriterGamebookBranchButton>;

  /** The content inside the page */
  @queryAssignedElements({
    flatten: true,
  })
  accessor slotContent: Array<HTMLElement>;

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
    return html`<slot class="page"></slot> `;
  }

  private mutationCallback = (mutationList: MutationRecord[]) => {
    if (!this.authoring) return;
    mutationList.forEach(
      ({ type, removedNodes, attributeName, target }) => {
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
      }
    );
    if (mutationList.some(record => record.type === "childList" && record.removedNodes.length)
      && !this.firstElementChild && !this.textContent?.trim()) {
      const par = document.createElement("p");
      par.textContent = this.localize.msg("Write something here...");
      this.appendChild(par);
    }
  };
}
