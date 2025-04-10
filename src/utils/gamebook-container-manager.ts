import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
} from "lit/decorators.js";

//Drawflow Imports
import { DrawflowNode } from "drawflow";

import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "./gamebook-editor-state-context";
import { WebWriterGamebookPage } from "../widgets/webwriter-gamebook-page/webwriter-gamebook-page.component";
import { WebWriterGamebookButton } from "../widgets/webwriter-gamebook-button/webwriter-gamebook-button.component";
import { WebWriterGamebookBranchButton } from "../widgets/webwriter-gamebook-branch-button/webwriter-gamebook-branch-button.component";
import { WebWriterGamebookPopup } from "../widgets/webwriter-gamebook-popup/webwriter-gamebook-popup.component";
import { WebWriterGamebookBranch } from "../widgets/webwriter-gamebook-branch/webwriter-gamebook-branch.component";

@customElement("gamebook-container-manager")
export class GamebookContainerManager extends LitElementWw {
  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page, webwriter-gamebook-popup, webwriter-gamebook-branch",
  })
  accessor gamebookContainers;

  @query("slot") accessor slot;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  static get scopedElements() {
    return {
      // "webwriter-gamebook-page": WebWriterGamebookPage,
      // "webwriter-gamebook-popup": WebWriterGamebookPopup,
      // "webwriter-gamebook-branch": WebWriterGamebookBranch,
    };
  }

  /* 
  
  
  */
  constructor() {
    super();
  }

  /* 
  
  
  */
  protected firstUpdated(_changedProperties: any): void {
    const event = new CustomEvent("managerInitialized", {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);

    this._hideAllGamebookContainers();

    if (this.editorStore.selectedContainer !== undefined) {
      //Extraced the drawflowNodeId from the serialized container
      const value = this.editorStore.selectedContainer.attributes.find(
        (attr) => attr.name === "drawflownodeid"
      ).value;

      if (value) {
        const event = new CustomEvent("containerSelectFirstUpdate", {
          detail: { id: value },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      } else {
        const event = new CustomEvent("containerError", {
          detail: { id: value },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }
    }
  }

  /* 
  
  
  */
  render() {
    return html` <slot></slot> `;
  }

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
  public _notifyContainerGotDeleted(drawflowNodeId: Number) {
    const event = new CustomEvent("containerDeleted", {
      detail: { id: drawflowNodeId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
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
  public _getContainerByDrawflowNodeId(id: number) {
    const container = this.gamebookContainers.find(
      (container) => container.drawflowNodeId === id
    );

    if (!container) {
      console.error(`Error with finding element for node (ID: ${id})`);
    }

    return container;
  }

  /*

  */
  public _renameContainer(id: string, title: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == id
    );

    (container as WebWriterGamebookPage).pageTitle = title;
  }

  /*


  */
  public _showGamebookContainerById(nodeId: number) {
    let isContainerShown = false; // Flag to track if any container is shown

    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == nodeId) {
        container.show();
        isContainerShown = true; // Set flag to true when a container is shown
      } else {
        container.hide();
      }
    });

    if (!isContainerShown) {
      console.error(`Error with finding element for node (ID: ${nodeId})`);
    }
  }

  /*


  */
  public _hideAllGamebookContainers() {
    console.log("hideAll");
    this.gamebookContainers.forEach((container) => {
      //console.log(container);
      container.style.display = "none";
      //console.log(container);
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
      "webwriter-gamebook-button"
    ) as WebWriterGamebookButton;

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
      "webwriter-gamebook-branch-button"
    ) as WebWriterGamebookBranchButton;

    branchButton.setAttribute("name", inputNode.data.title);
    branchButton.setAttribute("dataTargetId", inputNode.id.toString());
    // Ensure uniqueness by adding a unique identifier
    branchButton.setAttribute(
      "identifier",
      `${outputNode.id}-${output_class}-${inputNode.id}-${input_class}`
    );

    container.appendChild(branchButton);

    container.branchesOff = inputNode.id;

    const branchContainer = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == inputNode.id
    );

    branchContainer.incomingContainerId = outputNode.id;
  }

  /*


  */
  public removeButtonFromContainer(
    outputId: string,
    inputId: string,
    outputClass: string,
    inputClass: string
  ) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == outputId
    );

    const button = Array.from(
      container.buttons as NodeListOf<HTMLElement>
    ).find((button) => {
      return (
        (button as any).identifier ===
        `${outputId}-${outputClass}-${inputId}-${inputClass}`
      );
    });

    if (button) {
      button.setAttribute("identifier", "x");
      button.remove();

      if (
        button.constructor ===
        customElements.get("webwriter-gamebook-branch-button")
      ) {
        container.branchesOff = -1;
        const branchContainer = this.gamebookContainers.find(
          (container) => container.getAttribute("drawflowNodeId") == inputId
        );
        branchContainer.incomingContainerId = -1;
        branchContainer.clearRules();
      }
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
  public highlightButtonInContainer(containerId, identifier) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    if (
      container.constructor === customElements.get("webwriter-gamebook-page") ||
      container.constructor === customElements.get("webwriter-gamebook-popup")
    ) {
      const connButton = container.buttons.find(
        (button) => button.identifier === identifier
      );

      if (connButton) {
        if (!connButton.classList.contains("ww-selected")) {
          connButton.classList.add("highlighted");
        }
      }
    }
  }

  /*

  */
  public unhighlightButtonInContainer(containerId, identifier) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    if (
      container.constructor === customElements.get("webwriter-gamebook-page") ||
      container.constructor === customElements.get("webwriter-gamebook-popup")
    ) {
      const connButton = container.buttons.find(
        (button) => button.identifier === identifier
      );

      if (connButton) {
        connButton.classList.remove("highlighted");
      }
    }
  }

  /*

  */
  public selectButtonInContainer(containerId, identifier) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    const connButton = container.buttons.find(
      (button) => button.identifier === identifier
    );

    if (connButton) {
      connButton.focus();
    }
  }

  /*

  */
  public createContainerFromNode(node) {
    switch (node.class) {
      case "page":
      case "origin":
        return this._createContainerElement(
          node,
          "webwriter-gamebook-page",
          node.class == "origin" ? "1" : "0"
        );
        break;
      case "popup":
        return this._createContainerElement(node, "webwriter-gamebook-popup");
        break;
      case "branch":
        return this._createContainerElement(node, "webwriter-gamebook-branch");
        break;
    }
  }

  /*

  */
  private _createContainerElement(
    node: DrawflowNode,
    tagName: string,
    originPage?: string
  ) {
    const container = document.createElement(tagName) as HTMLElement;
    container.setAttribute("drawflowNodeId", node.id.toString());
    container.setAttribute("pageTitle", node.data.title);

    if (originPage) {
      container.setAttribute("originPage", originPage);
    }

    (container as any).hide();
    return container;
  }

  /* 
  
  
  */
  public importContainers(template: Array<Object>) {
    let containers = template.map((info) =>
      this.createContainerFromImport(info)
    );

    return containers;
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

  /*
  
  
  */
  public updateBranchContainerRuleTarget(output_id, output_class, input_id) {
    const branchContainer = this._getContainerByDrawflowNodeId(output_id);
    branchContainer._updateRuleTarget(output_class, input_id);
  }

  /*
  
  
  */
  public removeBranchContainerRuleElements(output_id, element_id, isQuiz) {
    const branchContainer = this._getContainerByDrawflowNodeId(output_id);

    const removeConnectionsFromOutputs = (
      branchContainer as WebWriterGamebookBranch
    ).removeElementOfRules(element_id, isQuiz);

    return removeConnectionsFromOutputs;
  }

  /*


  */
  public copyAndPasteContainerContents(pastedNode) {
    const pastedContainer = this.createContainerFromNode(pastedNode);

    const copiedContainer = this._getContainerByDrawflowNodeId(
      this.editorStore.copiedNode.id
    );

    // Iterate through each element in copiedContainer's slotContent
    if (copiedContainer.slotContent) {
      copiedContainer.slotContent.forEach((element) => {
        // Skip elements with specific tag names
        if (
          element.tagName.toLowerCase() === "webwriter-gamebook-button" ||
          element.tagName.toLowerCase() === "webwriter-gamebook-branch-button"
        ) {
          return; // Skip this element
        }

        // Create a new element of the same type
        const newElement = document.createElement(element.tagName);

        // Manually copy desired attributes, skipping 'id'
        [...element.attributes].forEach((attr) => {
          if (attr.name !== "id" && attr.name !== "contenteditable") {
            // Skip the 'id' attribute
            newElement.setAttribute(attr.name, attr.value);
          }
        });

        // Copy inner content (text or children) if necessary
        newElement.innerHTML = element.innerHTML; // or use another approach based on your needs

        // Append the new element to pastedContainer's slot
        pastedContainer.appendChild(newElement);
      });
    }

    return pastedContainer;
  }

  /*


  */
  public changeOrigin(newId) {
    const originPageContainer = this.gamebookContainers.find(
      (container) => container.getAttribute("originPage") === "1"
    );

    if (originPageContainer) {
      (originPageContainer as WebWriterGamebookPage).originPage = 0;
    }
    const newOriginPageContainer = this._getContainerByDrawflowNodeId(newId);
    (newOriginPageContainer as WebWriterGamebookPage).originPage = 1;
  }
}
