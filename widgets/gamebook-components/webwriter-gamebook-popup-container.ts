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
import { SlButton, SlDialog } from "@shoelace-style/shoelace";

@customElement("webwriter-gamebook-popup-container")
export class WebWriterGamebookPopupContainer extends LitElementWw {
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
        height: auto;
        pointer-events: none;
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
    };
  }
  //associated node id
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId = null;

  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-connection-button",
  })
  accessor connectionButtons;

  @query("#dialog") accessor dialog: SlDialog;

  // Create an observer instance linked to the callback function
  private mutationObserver: MutationObserver;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

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

    this.addEventListener("click", () => {
      console.log("popup Container clicked");
      this.focus();
    });
  }
  /*


  */
  render() {
    return html` ${this.isContentEditable
      ? html` <slot class="page"></slot>`
      : html`
          <sl-dialog id="dialog" no-header style="--width: 100%;"
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

  // Pause the observer
  public pauseObserver() {
    this.mutationObserver.disconnect();
  }

  // Resume the observer
  public resumeObserver() {
    const config = { attributes: true, childList: true, subtree: true };
    this.mutationObserver.observe(this, config);
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

              console.log("noticed");

              if (connButton.identifier != "connectionDeletedInNodeEditor") {
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
        });
      }
    });
  };
}
