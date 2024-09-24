import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAll,
  queryAssignedElements,
} from "lit/decorators.js";

//Drawflow Imports
import Drawflow, { DrawflowConnection, DrawflowNode } from "drawflow";
import { WebWriterConnectionButton } from "./gamebook-components/webwriter-connection-button";
import { WebWriterGamebookPageContainer } from "./gamebook-components/webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./gamebook-components/webwriter-gamebook-popup-container";
import { WebWriterGamebookBranchContainer } from "./gamebook-components/webwriter-gamebook-branch-container";
import { WebWriterSmartBranchButton } from "./gamebook-components/webwriter-smart-branch-button";

@customElement("gamebook-container-manager")
export class GamebookContainerManager extends LitElementWw {
  //
  @property({ attribute: false }) accessor appendToShadowDom = (
    element: HTMLElement
  ) => {};

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, webwriter-gamebook-branch-container",
  })
  accessor gamebookContainers;

  @property({ type: Object, attribute: true }) accessor editorContent;

  static get scopedElements() {
    return {
      "webwriter-gamebook-page-container": WebWriterGamebookPageContainer,
      "webwriter-gamebook-popup-container": WebWriterGamebookPopupContainer,
      "webwriter-gamebook-branch-container": WebWriterGamebookBranchContainer,
    };
  }

  protected firstUpdated(_changedProperties: any): void {}

  render() {
    return html` <slot></slot> `;
  }

  // private handleSlotChange(event) {
  //   const slot = event.target;

  //   const assignedElements = slot.assignedElements({ flatten: true });

  //   const lastPos =
  //     assignedElements.length - 1 > 0 ? assignedElements.length - 1 : 0;

  //   const lastAddedContainer = assignedElements[lastPos];

  //   if (lastAddedContainer?.getNodeEditor == undefined) {
  //     lastAddedContainer.getNodeEditor = this.getNodeEditor;
  //   }
  // }

  /* 
  
  
  */
  public _deleteGamebookContainersById(drawflowNodeId: Number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == drawflowNodeId) {
        container.remove();
      }
    });
  }

  /* 
  
  
  */
  public _deleteAllGamebookContainers() {
    this.gamebookContainers.forEach((container) => {
      container.remove();
    });
    //("delete successfull", this.gamebookContainers);
  }

  /*


  */
  public _getContainerByDrawflowNodeId(id: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == id
    );

    return container;
  }

  /*

  */
  public _renameContainer(id: string, title: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == id
    );

    (container as WebWriterGamebookPageContainer).pageTitle = title;
  }

  /*


  */
  public _showGamebookContainerById(nodeId: Number) {
    //console.log("iteration");
    this.gamebookContainers.forEach((container) => {
      //console.log("iteration");
      if (container.drawflowNodeId == nodeId) {
        //console.log("enter");
        container.show();
        //console.log(container);
      } else {
        container.hide();
      }
    });
  }

  /*


  */
  public _hideAllGamebookContainers() {
    this.gamebookContainers.forEach((container) => {
      container.hide();
    });
  }

  /*


  */
  public addConnectionButtonToContainer(
    outputNode: DrawflowNode,
    inputNode: DrawflowNode,
    output_class: string,
    input_class: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == outputNode.id
    );

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

    container.appendChild(connButton);
  }

  /*


  */
  public addSmartBranchButtonToContainer(
    outputNode: DrawflowNode,
    inputNode: DrawflowNode,
    output_class: string,
    input_class: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == outputNode.id
    );

    const branchButton = document.createElement(
      "webwriter-smart-branch-button"
    ) as WebWriterSmartBranchButton;

    branchButton.setAttribute("name", inputNode.data.title);
    branchButton.setAttribute("dataTargetId", inputNode.id.toString());
    // Ensure uniqueness by adding a unique identifier
    branchButton.setAttribute(
      "identifier",
      `${outputNode.id}-${output_class}-${inputNode.id}-${input_class}`
    );

    container.appendChild(branchButton);
  }

  /*


  */
  public removeConnectionButtonFromContainer(
    containerId: string,
    identifier: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    const connButton =
      container.shadowRoot?.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      ) ||
      container.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      );

    if (connButton) {
      connButton.setAttribute("identifier", "x");
      connButton.remove();
    }
  }

  /*


  */
  public removeSmartBranchButtonFromContainer(
    containerId: string,
    identifier: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    const branchButton =
      container.shadowRoot?.querySelector(
        `webwriter-smart-branch-button[identifier="${identifier}"]`
      ) ||
      container.querySelector(
        `webwriter-smart-branch-button[identifier="${identifier}"]`
      );

    if (branchButton) {
      branchButton.setAttribute("identifier", "x");
      branchButton.remove();
    }
  }

  /*


  */
  public updateButtonIdsAfterOutputRemove(
    containerId: string,
    removed_output_class: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    //console.log(removed_output_class);

    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      removed_output_class.split("_")[1],
      10
    );

    // Iterate over each linkButton to update its identifier
    if (container.buttons) {
      container.buttons.forEach((button) => {
        const [output_id, output_class, input_id] =
          button.identifier.split("-");
        const buttonOutputClassNumber = parseInt(
          output_class.split("_")[1],
          10
        );

        // Check if the linkButton should be updated
        if (buttonOutputClassNumber > removedOutputClassNumber) {
          // Generate the new identifier with incremented output_class
          const newIdentifier = `${output_id}-output_${
            buttonOutputClassNumber - 1
          }-${input_id}-input_1`;

          // Update the identifier
          button.setAttribute("identifier", newIdentifier);
        }
      });
    }
  }

  /*

  */
  public highlightConnectionButtonInContainer(containerId, identifier) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );
    const connButton =
      container.shadowRoot?.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      ) ||
      container.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      );

    if (connButton) {
      if (!connButton.classList.contains("ww-selected")) {
        connButton.classList.add("highlighted");
      }
    }
  }

  /*

  */
  public unhighlightConnectionButtonInContainer(containerId, identifier) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );
    const connButton =
      container.shadowRoot?.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      ) ||
      container.querySelector(
        `webwriter-connection-button[identifier="${identifier}"]`
      );

    if (connButton) {
      connButton.classList.remove("highlighted");
    }
  }

  /*

  */
  public _createPageContainerFromPageNode(pageNode: DrawflowNode) {
    //console.log("pageNode in Manager", pageNode.id.toString());
    const pageContainer = document.createElement(
      "webwriter-gamebook-page-container"
    ) as WebWriterGamebookPageContainer;
    pageContainer.setAttribute("drawflowNodeId", pageNode.id.toString());
    pageContainer.setAttribute("pageTitle", pageNode.data.title);

    if (pageNode.class == "origin") {
      pageContainer.setAttribute("originPage", "1");
    } else {
      pageContainer.setAttribute("originPage", "0");
    }

    // const parser = new DOMParser();
    // const contentFromNode = parser.parseFromString(
    //   pageNode.data.content,
    //   "text/html"
    // );

    // // Loop through the child nodes of the body of the parsed document
    // contentFromNode.body.childNodes.forEach((node) => {
    //   pageContainer.appendChild(node);
    // });

    //to let it access editor
    pageContainer.hide();

    //
    this.appendToShadowDom(pageContainer);

    //console.log("created Page Container", pageContainer);
  }

  /*


  */
  public _createPopupContainerFromPopupNode(popupNode: DrawflowNode) {
    //console.log(this.gamebookContainers);
    const popupContainer = document.createElement(
      "webwriter-gamebook-popup-container"
    ) as WebWriterGamebookPageContainer;
    popupContainer.setAttribute("drawflowNodeId", popupNode.id.toString());
    popupContainer.setAttribute("pageTitle", popupNode.data.title);

    // const parser = new DOMParser();
    // const contentFromNode = parser.parseFromString(
    //   popupNode.data.content,
    //   "text/html"
    // );

    // // Loop through the child nodes of the body of the parsed document
    // contentFromNode.body.childNodes.forEach((node) => {
    //   popupContainer.appendChild(node);
    // });

    //to let it access editor
    popupContainer.hide();

    //
    this.appendToShadowDom(popupContainer);
  }

  /* 
  
  
  */
  public _createBranchContainer(branchNode: DrawflowNode) {
    //console.log(this.gamebookContainers);
    const branchContainer = document.createElement(
      "webwriter-gamebook-branch-container"
    ) as WebWriterGamebookBranchContainer;
    branchContainer.setAttribute("drawflowNodeId", branchNode.id.toString());

    // const parser = new DOMParser();
    // const contentFromNode = parser.parseFromString(
    //   branchNode.data.content,
    //   "text/html"
    // );
    // // Loop through the child nodes of the body of the parsed document
    // contentFromNode.body.childNodes.forEach((node) => {
    //   branchContainer.appendChild(node);
    // });
    //to let it access editor
    branchContainer.hide();
    //
    this.appendToShadowDom(branchContainer);
  }

  /* 
  
  
  */
  private importContainers(template: Array<Object>) {
    //console.log(template);
    let containers = template.map((info) =>
      this.createContainerFromImport(info)
    );
    containers.forEach((container) => {
      this.appendToShadowDom(container);
    });
  }

  /*


  */
  private createContainerFromImport(info) {
    let element = document.createElement(info.tagName);
    info.attributes.forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
    element.innerHTML = info.innerHTML;
    return element;
  }

  /*


  */
  public searchContainers(value: string): Number[] {
    let matchContainerIds: Number[] = [];
    const searchValue = value.toLowerCase();

    this.gamebookContainers.forEach((container) => {
      const slotElements = container.querySelectorAll("*"); // Get all child elements in the container

      slotElements.forEach((element) => {
        // Check if the tagName or textContent includes the search value
        if (
          element.tagName.toLowerCase().includes(searchValue) ||
          (element.textContent &&
            element.textContent.toLowerCase().includes(searchValue))
        ) {
          matchContainerIds = [...matchContainerIds, container.drawflowNodeId];
        }
      });
    });

    return matchContainerIds;
  }
}
