import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook-model";

import { LinkButton } from "./link-button";

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";

//CSS
import styles from "../css/page-container-css";

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

  // Query the slot element
  @query("slot") slot;

  @queryAssignedElements({ flatten: true, selector: "link-button" })
  linkButtons;

  private mutationObserver: MutationObserver;

  constructor() {
    super();
    // Initialize the MutationObserver
    // this.mutationObserver = new MutationObserver(
    //   this.handleMutations.bind(this)
    // );
  }

  protected firstUpdated(_changedProperties: any): void {
    // // Start observing the slot for changes
    // this.mutationObserver.observe(this, {
    //   childList: true, // Watch for changes to the children
    //   subtree: true, // Watch for changes in all descendants
    //   characterData: true, // Watch for text changes
    // });
  }

  render() {
    return html`<slot
      class="page"
      @slotchange="${this.handleSlotChange}"
    ></slot>`;
  }

  hide() {
    this.style.display = "none";
  }

  show() {
    this.style.display = "block";
  }

  // Method to update the contentHtml property when slot content changes
  handleSlotChange() {
    // Re-observe the new nodes
    // this.mutationObserver.observe(this.slot, {
    //   childList: true, // Watch for changes to the children
    //   subtree: true, // Watch for changes in all descendants
    //   characterData: true, // Watch for text changes
    // });
    //console.log("slot change in page container");
  }

  // // Method to handle mutations
  // handleMutations(mutationsList) {
  //   // Get all the assigned nodes (elements) within the slot
  //   const assignedNodes = this.slot.assignedNodes({ flatten: true });

  //   // Initialize an empty string to hold the concatenated HTML
  //   let newContent = "";

  //   // Loop through each assigned node
  //   for (const node of assignedNodes) {
  //     // Check if the node is an element node (to avoid text nodes, comments, etc.)
  //     if (node.nodeType == Node.ELEMENT_NODE) {
  //       // Convert the element node to an HTML string and concatenate it
  //       newContent += node.outerHTML;
  //     }
  //   }

  //console.log(newContent);

  // TODO: Is this appropriate ?
  //
  // }
}
