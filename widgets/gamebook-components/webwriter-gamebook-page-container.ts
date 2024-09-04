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

//TODO: Deleting container should delete node!
//TODO: dialog, or not offer this?

//TODO: Introduce a map which gives all objects in the slots unique ids such that i can reference them for the rules branch
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
  accessor drawflowNodeId = null;
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle = "";
  @property({ type: Number, attribute: true, reflect: true })
  accessor originPage = 0;
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  @query("slot") accessor slotElement;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-connection-button, webwriter-smart-branch-button",
  })
  accessor buttons;

  //TODO: watch this for mutations, remove divs, use it to map the things with ids,
  //use the id array in the branch node details as selector
  //use the array with ids to identify the items in the gamebook
  @queryAssignedElements({
    flatten: true,
  })
  accessor slotContent;

  // @property({ type: Array, attribute: true, reflect: true })
  // accessor childrenIdMap: Array<[AcyclicNodeRepresentation, string]> = [];

  // Create an observer instance linked to the callback function
  private mutationObserver: MutationObserver;

  /* 
  
  
  */
  constructor() {
    super();
    this.mutationObserver = new MutationObserver(this.mutationCallback);
  }

  /* 
  
  TODO: Edit the package.json such that gamebook only takes containers as input
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
  // private generateUniqueId(prefix: string = "ww-gamebook-id-"): string {
  //   return `${prefix}${Date.now()}`;
  // }

  // /*
  //   Compares two NodeRepresentation objects to determine if they represent the same node.
  //   This function compares both tagName and textContent.
  //  */
  // private compareNodeRepresentations(
  //   rep1: AcyclicNodeRepresentation,
  //   rep2: AcyclicNodeRepresentation
  // ): boolean {
  //   return (
  //     rep1.tagName === rep2.tagName && rep1.textContent === rep2.textContent
  //   );
  // }

  // /*

  // */
  private serializeSlotContent() {
    // console.log("slotContet enter", this.slotContent);
    // this.slotContent.forEach((node, index) => {
    //   //create new item with new id
    //   if (!this.childrenIdMap[index]) {
    //     const newNodeRepresentation: AcyclicNodeRepresentation = {
    //       tagName: (node as HTMLElement).tagName,
    //       textContent: (node as HTMLElement).textContent,
    //     };
    //     const newId = this.generateUniqueId();
    //     this.childrenIdMap = [
    //       ...this.childrenIdMap,
    //       [newNodeRepresentation, newId],
    //     ];
    //   }
    //   //update the node representation
    //   else {
    //     const nodeRepresentation: AcyclicNodeRepresentation = {
    //       tagName: (node as HTMLElement).tagName,
    //       textContent: (node as HTMLElement).textContent,
    //     };
    //     let nodesIdentical = this.compareNodeRepresentations(
    //       nodeRepresentation,
    //       this.childrenIdMap[index][0]
    //     );
    //     if (!nodesIdentical) {
    //       this.childrenIdMap[index][0] = nodeRepresentation;
    //       this.childrenIdMap = [...this.childrenIdMap];
    //     }
    //   }
    // });
    // console.log("childrenIdMap after", this.childrenIdMap);
    // console.log("");
  }

  // /*

  // */
  private handleSlotContentDelete(node: Node) {
    // console.log("this node was deleted", node);
    // const nodeRepresentation: AcyclicNodeRepresentation = {
    //   tagName: (node as HTMLElement).tagName,
    //   textContent: (node as HTMLElement).textContent,
    // };
    // this.childrenIdMap.forEach((nodeIdTuple, index) => {
    //   let nodesIdentical = this.compareNodeRepresentations(
    //     nodeRepresentation,
    //     nodeIdTuple[0]
    //   );
    //   //node got deleted
    //   if (nodesIdentical) {
    //     this.childrenIdMap.splice(index, 1);
    //     this.childrenIdMap = [...this.childrenIdMap];
    //   }
    // });
    // console.log("slotContet after deletion", this.slotContent);
    // console.log("childrenIdMap after deletion", this.childrenIdMap);
    // console.log("");
  }

  /*

  */
  private mutationCallback = (mutationList: MutationRecord[]) => {
    mutationList.forEach((mutation) => {
      //this.serializeSlotContent();
      //console.log("mutationObserver", this.slotContent);

      if (mutation.type == "childList") {
        /*

        */
        mutation.addedNodes.forEach((node) => {
          //console.log("node added", node);
          // const length = this.slotContent.length;
          // console.log("node added true", this.slotContent[length - 1]);
          // const id = this.getOrAssignNodeId(this.slotContent[length - 1]);
          // console.log(id);
          // console.log(this.childrenIdMap);
        });

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
        });
      }

      // // Track text content changes (characterData) within child elements
      // if (mutation.type === "characterData") {
      //   // console.log("Text content changed:", mutation.target.nodeValue);
      // }
    });
  };
}
