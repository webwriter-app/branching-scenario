import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import { WebWriterGamebookButton } from "../webwriter-gamebook-button/webwriter-gamebook-button.component";

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";
import { WebWriterGamebookBranchButton } from "../webwriter-gamebook-branch-button/webwriter-gamebook-branch-button.component";

export class WebWriterGamebookPage extends LitElementWw {
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  //import CSS
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

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      //"webwriter-gamebook-button": WebWriterGamebookButton,
      //"webwriter-gamebook-options": WebWriterGamebookOptions,
    };
  }
  //associated node id
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId;
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle;
  @property({ type: Number, attribute: true, reflect: true })
  accessor originPage;
  @property({ type: Number, attribute: true, reflect: true })
  accessor branchesOff = -1;

  @query("slot") accessor slotElement;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-button, webwriter-gamebook-branch-button",
  })
  accessor buttons;

  @queryAssignedElements({
    flatten: true,
  })
  accessor slotContent;

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

  /*


  */
  public hide() {
    this.style.display = "none";
    //TODO after Thesis: move it to the right in viewer
    //TODO after Thesis: stop interactive content from playing
    //this.stopAllMedia();
  }

  /*


  */
  public show() {
    this.style.display = "block";
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
  };
}
