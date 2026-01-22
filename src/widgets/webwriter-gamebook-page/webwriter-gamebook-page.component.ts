import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import { msg, localized } from "@lit/localize";
import { WebWriterGamebookButton } from "../webwriter-gamebook-button/webwriter-gamebook-button.component";

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";
import { WebWriterGamebookBranchButton } from "../webwriter-gamebook-branch-button/webwriter-gamebook-branch-button.component";
import { WebWriterGamebookOptions } from "../../components/options-panel/webwriter-gamebook-options";

import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

/**
 * Represents a page of the gamebook
 */
@localized()
export class WebWriterGamebookPage extends LitElementWw {
  /** The state of the editor in a stringified JSON format */
  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  /** @internal */
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  /**
   * import CSS
   * @internal
   */
  static get styles() {
    return css`
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
    `;
  }

  /**
   * registering custom elements used in the widget
   * @internal
   */
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      //"webwriter-gamebook-button": WebWriterGamebookButton,
      "webwriter-gamebook-options": WebWriterGamebookOptions,
    };
  }

  /** Associated node id */
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId;
  /** The title of the page */
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle;
  /** The origin page number */
  @property({ type: Number, attribute: true, reflect: true })
  accessor originPage;
  /** The id of the branch connected to the page */
  @property({ type: Number, attribute: true, reflect: true })
  accessor branchesOff = -1;

  /** @internal */
  @query("slot") accessor slotElement;

  /** The gamebook buttons on the page */
  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-button, webwriter-gamebook-branch-button",
  })
  accessor buttons;

  /** The content inside the page */
  @queryAssignedElements({
    flatten: true,
  })
  accessor slotContent: Array<HTMLElement>;

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
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    };
    // Start observing the target node for configured mutations
    this.mutationObserver.observe(this, config);

    //create an empty p element if container has no children
    const slot = this.shadowRoot.querySelector("slot");
    const assignedElements = slot.assignedElements();

    if (assignedElements.length == 0) {
      const par = document.createElement("p");
      par.textContent = msg("Write something here...");
      this.appendChild(par);
    }
  }

  /*


  */
  render() {
    return html`<slot class="page"></slot>
      <webwriter-gamebook-options
        class="author-only"
        part="options"
      ></webwriter-gamebook-options> `;
  }

  /**
   * Hides the page
   */
  public hide() {
    this.style.display = "none";
    //TODO after Thesis: move it to the right in viewer
    this.stopAllMedia();
  }

  /**
   * Shows the page
   */
  public show() {
    this.style.display = "block";
  }

  /**
   * Stops all HTML media elements on the page
   */
  private stopAllMedia() {
    const mediaElements = this.slotContent.filter((el) =>
      el.matches("audio, video")
    ) as (HTMLAudioElement | HTMLVideoElement)[];

    mediaElements.forEach((media) => {
      media.pause();
      media.currentTime = 0;
    });
  }

  /*

  */
  private mutationCallback = (mutationList: MutationRecord[]) => {
    mutationList.forEach(
      ({ type, removedNodes, addedNodes, attributeName, target }) => {
        //
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

          // Check if there is at least one paragraph <p> element in the container
          const paragraphs = this.querySelectorAll("p");
          if (paragraphs.length === 0) {
            const par = document.createElement("p");
            par.textContent = msg("Write something here...");
            this.appendChild(par);
          }
        }
      }
    );
  };
}
