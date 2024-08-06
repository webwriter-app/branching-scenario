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

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";

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
  @property({ type: Number, attribute: true, reflect: true }) drawflowNodeId =
    null;
  @property({ type: String, attribute: true, reflect: true }) pageTitle = "";
  @property({ type: Number, attribute: true, reflect: true }) originPage = 0;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-connection-button",
  })
  connectionButtons;

  // Create an observer instance linked to the callback function
  private mutationObserver: MutationObserver;

  // static shadowRootOptions = {
  //   ...LitElement.shadowRootOptions,
  //   delegatesFocus: true,
  // };

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
    // Start observing the target node for configured mutations
    this.mutationObserver.observe(this, config);

    this.addEventListener("click", () => {
      //console.log("page Container clicked");
      this.focus();
    });
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
        mutation.addedNodes.forEach((node) => {
          if (
            (node as Element).nodeName.toLowerCase() ==
            "webwriter-connection-button"
          ) {
            //console.log("LinkButton added:", node);
          }
        });
        mutation.removedNodes.forEach((node) => {
          if (
            (node as HTMLElement).nodeName.toLowerCase() ==
            "webwriter-connection-button"
          ) {
            if ((node as HTMLElement).classList.contains("ww-widget")) {
              //make sure link button did not get deleted programtically
              let connButton = node as WebWriterConnectionButton;

              if (connButton.identifier != "connectionDeltedInNodeEditor") {
                //console.log("in mutation observer here");
                const event = new CustomEvent("userDeleteConnectionButton", {
                  detail: {
                    identifier: (node as WebWriterConnectionButton).identifier,
                  },
                  bubbles: true, // Allows the event to bubble up through the DOM
                  composed: true, // Allows the event to pass through shadow DOM boundaries
                });
                this.dispatchEvent(event);
              }
            }
          }
        });
      }
    });
  };
}
