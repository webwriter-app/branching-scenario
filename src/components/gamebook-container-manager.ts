import { html } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { property, queryAssignedElements } from "lit/decorators.js";
import type { DiagramNode } from "../model/diagram";
import type { ContainerTemplate } from "../model/editor-content";
import { consume } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "./gamebook-editor-state-context";
import { isBranch, isPage, type GamebookContainerElement } from "./gamebook-container";
import type { WebwriterGamebookButton } from "../widgets/webwriter-gamebook-button";
import type { WebwriterGamebookBranchButton } from "../widgets/webwriter-gamebook-branch-button";

export class GamebookContainerManager extends LitElementWw {
  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page, webwriter-gamebook-popup, webwriter-gamebook-branch",
  })
  accessor gamebookContainers: GamebookContainerElement[];

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  protected firstUpdated(): void {
    const event = new CustomEvent("managerInitialized", {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);

    this._hideAllGamebookContainers();

    if (this.editorStore.selectedContainer !== undefined) {
      const selected = this.editorStore.selectedContainer;
      const value = selected.getAttribute("drawflownodeid");

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

  render() {
    return html` <slot></slot> `;
  }

  public _deleteGamebookContainersById(drawflowNodeId: number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == drawflowNodeId) {
        container.remove();
      }
    });
  }

  public _notifyContainerGotDeleted(drawflowNodeId: number) {
    const event = new CustomEvent("containerDeleted", {
      detail: { id: drawflowNodeId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  public _deleteAllGamebookContainers() {
    this.gamebookContainers.forEach((container) => {
      container.remove();
    });
  }

  public _getContainerByDrawflowNodeId(id: number) {
    const container = this.gamebookContainers.find(
      (container) => container.drawflowNodeId === id
    );

    if (!container) {
      console.error(`Error with finding element for node (ID: ${id})`);
    }

    return container;
  }

  public _renameContainer(id: number, title: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == String(id)
    );

    if (container) container.pageTitle = title;
  }

  public _showGamebookContainerById(nodeId: number): boolean {
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
      this.dispatchEvent(
        new CustomEvent("containerNotFound", {
          bubbles: true,
          composed: true,
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("containerFound", {
          bubbles: true,
          composed: true,
        })
      );
    }

    return isContainerShown;
  }

  public _hideAllGamebookContainers() {
    for (const container of this.gamebookContainers) container.hide?.();
  }

  private containerByNodeId(id: string | number) {
    return this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == String(id)
    );
  }

  private buttonsOf(container: GamebookContainerElement | undefined) {
    return container && !isBranch(container) ? container.buttons : [];
  }

  private nodeButton(outputNode: DiagramNode, inputNode: DiagramNode, tagName: string, outputClass: string, inputClass: string) {
    const button = document.createElement(tagName) as WebwriterGamebookButton | WebwriterGamebookBranchButton;
    button.setAttribute("name", inputNode.data.title);
    button.setAttribute("dataTargetId", inputNode.id.toString());
    // Ensure uniqueness by adding a unique identifier
    button.setAttribute(
      "identifier",
      `${outputNode.id}-${outputClass}-${inputNode.id}-${inputClass}`
    );
    return button;
  }

  public addConnectionButtonToContainer(
    outputNode: DiagramNode,
    inputNode: DiagramNode,
    output_class: string,
    input_class: string
  ) {
    const container = this.containerByNodeId(outputNode.id);
    container?.appendChild(
      this.nodeButton(outputNode, inputNode, "webwriter-gamebook-button", output_class, input_class)
    );
  }

  public addSmartBranchButtonToContainer(
    outputNode: DiagramNode,
    inputNode: DiagramNode,
    output_class: string,
    input_class: string
  ) {
    const container = this.containerByNodeId(outputNode.id);
    if (!container) return;

    container.appendChild(
      this.nodeButton(outputNode, inputNode, "webwriter-gamebook-branch-button", output_class, input_class)
    );

    if (!isBranch(container)) container.branchesOff = inputNode.id;

    const branchContainer = this.containerByNodeId(inputNode.id);
    if (branchContainer && isBranch(branchContainer)) {
      branchContainer.incomingContainerId = outputNode.id;
    }
  }

  public removeButtonFromContainer(
    outputId: string,
    inputId: string,
    outputClass: string,
    inputClass: string
  ) {
    const container = this.containerByNodeId(outputId);

    const button = this.buttonsOf(container).find(
      (button) =>
        button.identifier === `${outputId}-${outputClass}-${inputId}-${inputClass}`
    );

    if (button) {
      button.setAttribute("identifier", "x");
      button.remove();

      if (button.localName === "webwriter-gamebook-branch-button") {
        if (container && !isBranch(container)) container.branchesOff = -1;
        const branchContainer = this.containerByNodeId(inputId);
        if (branchContainer && isBranch(branchContainer)) {
          branchContainer.incomingContainerId = -1;
          branchContainer.clearRules();
        }
      }
    }
  }

  public updateButtonIdsAfterOutputRemove(
    containerId: string,
    removed_output_class: string
  ) {
    const container = this.containerByNodeId(containerId);

    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      removed_output_class.split("_")[1],
      10
    );

    // Iterate over each linkButton to update its identifier
    this.buttonsOf(container).forEach((button) => {
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

  public highlightButtonInContainer(containerId: string | number, identifier: string) {
    const connButton = this.buttonsOf(this.containerByNodeId(containerId)).find(
      (button) => button.identifier === identifier
    );

    if (connButton && !connButton.classList.contains("ww-selected")) {
      connButton.classList.add("highlighted");
    }
  }

  public unhighlightButtonInContainer(containerId: string | number, identifier: string) {
    const connButton = this.buttonsOf(this.containerByNodeId(containerId)).find(
      (button) => button.identifier === identifier
    );

    connButton?.classList.remove("highlighted");
  }

  public selectButtonInContainer(containerId: string | number, identifier: string) {
    const connButton = this.buttonsOf(this.containerByNodeId(containerId)).find(
      (button) => button.identifier === identifier
    );

    connButton?.focus();
  }

  public createContainerFromNode(node: DiagramNode) {
    switch (node.class) {
      case "page":
      case "origin":
        return this._createContainerElement(
          node,
          "webwriter-gamebook-page",
          node.class == "origin" ? "1" : "0"
        );
      case "popup":
        return this._createContainerElement(node, "webwriter-gamebook-popup");
      case "branch":
        return this._createContainerElement(node, "webwriter-gamebook-branch");
    }
  }

  private _createContainerElement(
    node: DiagramNode,
    tagName: string,
    originPage?: string
  ) {
    const container = document.createElement(tagName) as GamebookContainerElement;
    container.setAttribute("drawflowNodeId", node.id.toString());
    container.setAttribute("pageTitle", node.data.title);

    if (originPage) {
      container.setAttribute("originPage", originPage);
    }

    container.hide();
    return container;
  }

  public importContainers(template: ContainerTemplate[]) {
    return template.map((info) => this.createContainerFromImport(info));
  }

  private createContainerFromImport(info: ContainerTemplate) {
    const element = document.createElement(info.tagName);
    info.attributes.forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
    element.innerHTML = info.innerHTML;
    return element;
  }

  public searchContainers(value: string): number[] {
    let matchContainerIds: number[] = [];
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

  public updateBranchContainerRuleTarget(output_id: number, output_class: string, input_id: number | string) {
    const branchContainer = this._getContainerByDrawflowNodeId(output_id);
    if (branchContainer && isBranch(branchContainer)) {
      branchContainer._updateRuleTarget(output_class, input_id);
    }
  }

  public removeBranchContainerRuleElements(output_id: number, element_id: string, isQuiz: boolean) {
    const branchContainer = this._getContainerByDrawflowNodeId(output_id);
    return branchContainer && isBranch(branchContainer)
      ? branchContainer.removeElementOfRules(element_id, isQuiz)
      : [];
  }

  public copyAndPasteContainerContents(pastedNode: DiagramNode) {
    const pastedContainer = this.createContainerFromNode(pastedNode);

    const copiedContainer = this._getContainerByDrawflowNodeId(
      this.editorStore.copiedNode.id
    );

    // Iterate through each element in copiedContainer's slotContent
    if (pastedContainer && copiedContainer && !isBranch(copiedContainer)) {
      copiedContainer.slotContent.forEach((element) => {
        // Skip elements with specific tag names
        if (
          element.tagName.toLowerCase() === "webwriter-gamebook-button" ||
          element.tagName.toLowerCase() === "webwriter-gamebook-branch-button"
        ) {
          return;
        }

        // Create a new element of the same type
        const newElement = document.createElement(element.tagName);

        // Manually copy desired attributes, skipping 'id'
        [...element.attributes].forEach((attr) => {
          if (attr.name !== "id" && attr.name !== "contenteditable") {
            newElement.setAttribute(attr.name, attr.value);
          }
        });

        // Copy inner content (text or children) if necessary
        newElement.innerHTML = element.innerHTML;

        // Append the new element to pastedContainer's slot
        pastedContainer.appendChild(newElement);
      });
    }

    return pastedContainer;
  }

  public changeOrigin(newId: number) {
    const originPageContainer = this.gamebookContainers.find(
      (container) => container.getAttribute("originPage") === "1"
    );

    if (originPageContainer && isPage(originPageContainer)) {
      originPageContainer.originPage = 0;
    }
    const newOriginPageContainer = this._getContainerByDrawflowNodeId(newId);
    if (newOriginPageContainer && isPage(newOriginPageContainer)) {
      newOriginPageContainer.originPage = 1;
    }
  }
}
