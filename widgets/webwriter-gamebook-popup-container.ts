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
  @property({ type: Number, attribute: true, reflect: true }) drawflowNodeId =
    null;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-connection-button",
  })
  connectionButtons;

  @query("#dialog") dialog: SlDialog;

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
    // Start observing the target node for configured mutations
    this.mutationObserver.observe(this, config);
    //
    // Prevent the dialog from closing when the user clicks on the overlay
    // this.dialog.addEventListener("sl-request-close", (event) => {
    //   if (event.detail.source === "overlay") {
    //     event.preventDefault();
    //   }
    // });
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

  /*


  */
  public addConnectionButtonToPopupContainer(
    outputNode: DrawflowNode,
    inputNode: DrawflowNode,
    output_class: string,
    input_class: string
  ) {
    const connButton = document.createElement(
      "webwriter-connection-button"
    ) as WebWriterConnectionButton;
    connButton.setAttribute("name", inputNode.data.title);
    connButton.setAttribute("dataTargetId", inputNode.id.toString());
    // Ensure uniqueness by adding a unique identifier
    connButton.setAttribute(
      "identifier",
      `${outputNode.id}-${output_class}-${inputNode.id}-${input_class}`
    );
    this.appendChild(connButton);
  }

  /*


  */
  public removeConnectionButtonFromPopupContainer(identifier: string) {
    const connButton =
      this.shadowRoot?.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      ) ||
      this.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      );

    if (connButton) {
      const parts = (connButton as WebWriterConnectionButton).identifier.split(
        "-"
      );
      const parsed = {
        outputNodeId: parseInt(parts[0]),
        outputClass: parts[1],
        inputNodeId: parseInt(parts[2]),
        inputClass: parts[3],
      };
      this.updateConnectionButtonIds(parsed.outputClass);
      connButton.setAttribute("identifier", "x");
      connButton.remove();
    }
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

              if (connButton.identifier != "x") {
                console.log("in mutation observer here");
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

  /*


  */
  public updateConnectionButtonIds(removed_output_class: string) {
    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      removed_output_class.split("_")[1],
      10
    );

    // Iterate over each linkButton to update its identifier
    this.connectionButtons.forEach((connButton) => {
      const [output_id, output_class, input_id] =
        connButton.identifier.split("-");
      const connButtonOutputClassNumber = parseInt(
        output_class.split("_")[1],
        10
      );

      // Check if the linkButton should be updated
      if (connButtonOutputClassNumber > removedOutputClassNumber) {
        // Generate the new identifier with incremented output_class
        const newIdentifier = `${output_id}-output_${
          connButtonOutputClassNumber - 1
        }-${input_id}-input_1`;

        // Update the identifier
        connButton.setAttribute("identifier", newIdentifier);
      }
    });
  }
}
