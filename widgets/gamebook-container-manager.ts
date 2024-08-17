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

@customElement("gamebook-container-manager")
export class GamebookContainerManager extends LitElementWw {
  //
  @property({ attribute: false }) appendToShadowDom = (
    element: HTMLElement
  ) => {};

  @property({ attribute: false }) getNodeEditor = () => {};

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, quiz-container",
  })
  gamebookContainers;

  @property({ type: Object, attribute: true }) editorContent;

  static get scopedElements() {
    return {
      "webwriter-gamebook-page-container": WebWriterGamebookPageContainer,
      "webwriter-gamebook-popup-container": WebWriterGamebookPopupContainer,
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

    // this.updateConnectionButtonIdsBeforeAdd(
    //   outputNode.id.toString(),
    //   output_class
    // );

    container.appendChild(connButton);
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

    //container.pauseObserver();

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

    //container.resumeObserver();
  }

  /*


  */
  public updateConnectionButtonIdsAfterRemove(
    containerId: string,
    removed_output_class: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      removed_output_class.split("_")[1],
      10
    );

    // Iterate over each linkButton to update its identifier
    container.connectionButtons.forEach((connButton) => {
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

  /*


  */
  public updateConnectionButtonIdsBeforeAdd(
    containerId: string,
    added_output_class: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    // Extract the number from the output_class parameter
    const addedOutputClassNumber = parseInt(
      added_output_class.split("_")[1],
      10
    );

    // Find the index of the first button with outputClass == addedOutputClassNumber
    const startIndex = container.connectionButtons.findIndex((connButton) => {
      const [output_id, output_class, input_id] =
        connButton.identifier.split("-");
      const connButtonOutputClassNumber = parseInt(
        output_class.split("_")[1],
        10
      );
      return connButtonOutputClassNumber === addedOutputClassNumber;
    });

    // If a matching button was found, update subsequent buttons
    if (startIndex !== -1) {
      // Iterate over each linkButton to update its identifier
      container.connectionButtons.forEach((connButton) => {
        const [output_id, output_class, input_id] =
          connButton.identifier.split("-");
        const connButtonOutputClassNumber = parseInt(
          output_class.split("_")[1],
          10
        );

        // Check if the linkButton should be updated
        if (connButtonOutputClassNumber >= addedOutputClassNumber) {
          // Generate the new identifier with incremented output_class
          const newIdentifier = `${output_id}-output_${
            connButtonOutputClassNumber + 1
          }-${input_id}-input_1`;

          // Update the identifier
          connButton.setAttribute("identifier", newIdentifier);
        }
      });
    }
  }

  /*


  */

  /*


  */

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

    const parser = new DOMParser();
    const contentFromNode = parser.parseFromString(
      pageNode.data.content,
      "text/html"
    );

    // Loop through the child nodes of the body of the parsed document
    contentFromNode.body.childNodes.forEach((node) => {
      pageContainer.appendChild(node);
    });

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

    const parser = new DOMParser();
    const contentFromNode = parser.parseFromString(
      popupNode.data.content,
      "text/html"
    );

    // Loop through the child nodes of the body of the parsed document
    contentFromNode.body.childNodes.forEach((node) => {
      popupContainer.appendChild(node);
    });

    //to let it access editor
    popupContainer.hide();

    //
    this.appendToShadowDom(popupContainer);
  }

  /* 
  
  
  */
  private importContainers(template: Array<Object>) {
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
}
