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

import { LinkButton } from "./link-button";

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";

//CSS
import styles from "../../css/page-container-css";

@customElement("page-container")
export class PageContainer extends LitElementWw {
  //import CSS
  static styles = [styles];

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "link-button": LinkButton,
    };
  }
  //associated node id
  @property({ type: Number, attribute: true, reflect: true }) drawflowNodeId =
    null;
  @property({ type: String, attribute: true, reflect: true }) pageTitle = "";
  @property({ type: Number, attribute: true, reflect: true }) originPage = 0;
  @property({ type: Boolean }) linkButtonRemoval = false;

  @queryAssignedElements({ flatten: true, selector: "link-button" })
  linkButtons;

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
  public addLinkButtonToPageContainer(
    outputNode: DrawflowNode,
    inputNode: DrawflowNode,
    output_class: string,
    input_class: string
  ) {
    const linkButton = document.createElement("link-button") as LinkButton;
    linkButton.setAttribute("name", inputNode.data.title);
    linkButton.setAttribute("dataTargetId", inputNode.id.toString());
    // Ensure uniqueness by adding a unique identifier
    linkButton.setAttribute(
      "identifier",
      `${outputNode.id}-${output_class}-${inputNode.id}-${input_class}`
    );
    this.appendChild(linkButton);

    //TODO: Remove this once frederic fixed appending of children
    const par = document.createElement("p");
    par.textContent = "";
    this.appendChild(par);
  }

  /*


  */
  public removeLinkButtonFromPageContainer(identifier: string) {
    const linkButton =
      this.shadowRoot?.querySelector(
        `link-button[identifier="${identifier}"]`
      ) || this.querySelector(`link-button[identifier="${identifier}"]`);

    if (linkButton) {
      const parts = (linkButton as LinkButton).identifier.split("-");
      const parsed = {
        outputNodeId: parseInt(parts[0]),
        outputClass: parts[1],
        inputNodeId: parseInt(parts[2]),
        inputClass: parts[3],
      };
      this.updateLinkButtonIds(parsed.outputClass);
      linkButton.setAttribute("identifier", "x");
      linkButton.remove();
    }
  }

  /*


  */
  private mutationCallback = (mutationList: MutationRecord[]) => {
    mutationList.forEach((mutation) => {
      if (mutation.type == "childList") {
        mutation.addedNodes.forEach((node) => {
          if ((node as Element).nodeName.toLowerCase() == "link-button") {
            //console.log("LinkButton added:", node);
          }
        });
        mutation.removedNodes.forEach((node) => {
          if ((node as HTMLElement).nodeName.toLowerCase() == "link-button") {
            if ((node as HTMLElement).classList.contains("ww-widget")) {
              //make sure link button did not get deleted programtically
              let linkButton = node as LinkButton;
              if (linkButton.identifier != "x") {
                const event = new CustomEvent("userDeleteLinkButton", {
                  detail: { identifier: (node as LinkButton).identifier },
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
  public updateLinkButtonIds(removed_output_class: string) {
    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      removed_output_class.split("_")[1],
      10
    );

    // Iterate over each linkButton to update its identifier
    this.linkButtons.forEach((linkButton) => {
      const [output_id, output_class, input_id] =
        linkButton.identifier.split("-");
      const linkButtonOutputClassNumber = parseInt(
        output_class.split("_")[1],
        10
      );

      // Check if the linkButton should be updated
      if (linkButtonOutputClassNumber > removedOutputClassNumber) {
        // Generate the new identifier with incremented output_class
        const newIdentifier = `${output_id}-output_${
          linkButtonOutputClassNumber - 1
        }-${input_id}-input_1`;

        // Update the identifier
        linkButton.setAttribute("identifier", newIdentifier);
      }
    });
  }
}
