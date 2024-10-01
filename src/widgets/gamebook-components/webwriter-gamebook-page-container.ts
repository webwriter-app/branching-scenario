import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import { WebWriterConnectionButton } from "./webwriter-connection-button";

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";
import { WebWriterSmartBranchButton } from "./webwriter-smart-branch-button";

import { provide, consume, createContext } from "@lit/context";
import { gamebookStore, GamebookStore } from "../context-test";

@customElement("webwriter-gamebook-page-container")
export class WebWriterGamebookPageContainer extends LitElementWw {
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
        height: 100%;
      }
    `;
  }

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "webwriter-connection-button": WebWriterConnectionButton,
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
  accessor tabIndex = -1;
  @property({ type: Number, attribute: true, reflect: true })
  accessor branchesOff = -1;

  @query("slot") accessor slotElement;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-connection-button, webwriter-smart-branch-button",
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
    return html`<slot class="page"></slot>`;
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
  private mutationCallback = (mutationList: MutationRecord[]) => {
    mutationList.forEach((mutation) => {
      if (mutation.type == "childList") {
        mutation.removedNodes.forEach((node) => {
          //this.handleSlotContentDelete(node);

          if (
            (node as HTMLElement).nodeName.toLowerCase() ==
            "webwriter-connection-button"
          ) {
            if ((node as HTMLElement).classList.contains("ww-widget")) {
              //make sure link button did not get deleted programtically
              let connButton = node as WebWriterConnectionButton;

              //console.log("LinkButton removed:", node);

              if (connButton.identifier != "x") {
                //console.log("in mutation observer here");
                const event = new CustomEvent(
                  "containerDeleteConnectionButton",
                  {
                    detail: {
                      identifier: (node as WebWriterConnectionButton)
                        .identifier,
                    },
                    bubbles: true, // Allows the event to bubble up through the DOM
                    composed: true, // Allows the event to pass through shadow DOM boundaries
                  }
                );
                this.dispatchEvent(event);
              }
            }
          }
          //
          else if (
            (node as HTMLElement).nodeName.toLowerCase() ==
            "webwriter-smart-branch-button"
          ) {
            if ((node as HTMLElement).classList.contains("ww-widget")) {
              //make sure link button did not get deleted programtically
              let connButton = node as WebWriterSmartBranchButton;

              //console.log("LinkButton removed:", node);

              if (connButton.identifier != "x") {
                //console.log("in mutation observer here");
                const event = new CustomEvent(
                  "containerDeleteConnectionButton",
                  {
                    detail: {
                      identifier: (node as WebWriterSmartBranchButton)
                        .identifier,
                    },
                    bubbles: true, // Allows the event to bubble up through the DOM
                    composed: true, // Allows the event to pass through shadow DOM boundaries
                  }
                );
                this.dispatchEvent(event);
              }
            }
          }
          //
          else if (
            (node as HTMLElement).nodeName.toLowerCase() == "webwriter-quiz" ||
            (node as HTMLElement).nodeName.toLowerCase() == "webwriter-task"
          ) {
            if ((node as HTMLElement).classList.contains("ww-widget")) {
              if (
                (node as HTMLElement).classList.contains(
                  "ProseMirror-selectednode"
                )
              ) {
                if (this.branchesOff !== -1) {
                  const event = new CustomEvent("quizElementDeleted", {
                    detail: {
                      containerId: this.branchesOff,
                      id: (node as HTMLElement).id,
                      isQuiz:
                        (node as HTMLElement).nodeName.toLowerCase() ==
                        "webwriter-quiz",
                    },
                    bubbles: true, // Allows the event to bubble up through the DOM
                    composed: true, // Allows the event to pass through shadow DOM boundaries
                  });
                  this.dispatchEvent(event);
                }
              }
            }
          }
        });
      }
    });
  };
}
