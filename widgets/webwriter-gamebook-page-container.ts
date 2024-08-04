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

//CSS
import styles from "../css/page-container-css";

@customElement("webwriter-gamebook-page-container")
export class WebWriterGamebookPageContainer extends LitElementWw {
  //import CSS
  static styles = [styles];

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

    // this.addEventListener("click", () => {
    //   console.log("page Container clicked");
    //   this.focus();
    // });
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
  public addConnectionButtonToPageContainer(
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
  public removeConnectionButtonFromPageContainer(identifier: string) {
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
