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

//Drawflow Imports
import Drawflow from "drawflow";
import { DrawflowNode } from "drawflow";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlTextarea,
  SlDivider,
  SlDropdown,
  SlMenu,
  SlMenuItem,
  SlIconButton,
  SlInput,
} from "@shoelace-style/shoelace";

import { LinkButton } from "./link-button";

//Bootstrap Icon Import
import Plus from "bootstrap-icons/icons/plus.svg";
import Dash from "bootstrap-icons/icons/dash.svg";
import Journal from "bootstrap-icons/icons/journal.svg";
import FileEarmark from "bootstrap-icons/icons/file-earmark.svg";
import PatchQuestion from "bootstrap-icons/icons/patch-question.svg";
import ThreeDotsVertical from "bootstrap-icons/icons/three-dots-vertical.svg";

//CSS
import styles from "../css/page-node-details-css";
import { PageContainer } from "./page-container";

@customElement("page-node-details")
export class PageNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-input": SlInput,
      "link-button": LinkButton,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @query(".nodeSelect")
  nodeSelect;
  @query("#textAreaHTML")
  textAreaHTML;

  //internal reactive state, not part of the component's API
  @state()
  editor?: Drawflow;

  @property({ type: Boolean }) isNodeSelected = false;

  //public properties are part of the component's public API
  @property({ type: Object, attribute: false }) selectedNode?: DrawflowNode;
  @property({ type: Number }) selectedNodeId = null;

  @property({ type: Object, attribute: false }) gamebook: Gamebook =
    new Gamebook();
  @property({ type: Number }) createdNodeId = null;
  @property({ type: Object, attribute: false }) nodesInEditor = {};

  protected firstUpdated(_changedProperties: any): void {
    this._resetSelect();
    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.createdNodeId = id;
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("selectedNodeId")) {
      this._resetSelect();
    }
  }

  render() {
    return html` <div class="page-node-details">
      <div class="title-bar">
        <div class="div-icon">
          <object type="image/svg+xml" data=${FileEarmark} class="svg"></object>
        </div>
        <div class="div-title">
          <p class="title">${this.selectedNode.data.title}</p>
          <p class="subtitle">Gamebook Page</p>
        </div>

        <div class="last-item">
          <div class="number-input">
            <p class="subtitle">Inputs</p>
            <div class="horizontal">
              <sl-icon-button
                src=${Dash}
                @click=${this._deleteInputOfSelectedNode}
              >
              </sl-icon-button>
              <p class="number">
                ${Object.keys(this.selectedNode.inputs).length.toString()}
              </p>
              <sl-icon-button
                src=${Plus}
                @click=${this._addInputToSelectedNode}
              >
              </sl-icon-button>
            </div>
          </div>

          <sl-divider vertical style="height: 30px;"></sl-divider>

          <div class="number-input">
            <p class="subtitle">Outputs</p>
            <div class="horizontal">
              <sl-icon-button
                src=${Dash}
                @click=${this._deleteOutputOfSelectedNode}
              >
              </sl-icon-button>
              <p class="number">
                ${Object.keys(this.selectedNode.outputs).length.toString()}
              </p>
              <sl-icon-button
                src=${Plus}
                @click=${this._addOutputToSelectedNode}
              >
              </sl-icon-button>
            </div>
          </div>
        </div>
      </div>

      <div class="controls">
        <sl-select
          class="nodeSelect"
          placeholder="Page"
          @sl-change=${this._handleSelectChange}
        >
          ${Object.keys(this.nodesInEditor)
            .filter(
              (key) => this.nodesInEditor[key].id !== this.selectedNode.id
            )
            .map(
              (key) =>
                html`<sl-option value=${this.nodesInEditor[key].id}>
                  ${this.nodesInEditor[key].data.title}
                </sl-option>`
            )}
        </sl-select>
        <sl-button
          @click=${() => this._connectSelectedNodes()}
          ?disabled=${!this.isNodeSelected}
          >Connect</sl-button
        >
        <sl-divider vertical style="height: 30px;"></sl-divider>

        <sl-dropdown>
          <sl-button slot="trigger">
            <object slot="prefix" type="image/svg+xml" data=${Plus}></object>
            Branch
          </sl-button>
          <sl-menu>
            <sl-menu-item
              @click=${() => this._addQuizBranchNodeToSelectedNode()}
            >
              <object
                slot="prefix"
                type="image/svg+xml"
                data=${PatchQuestion}
              ></object>
              Quiz
            </sl-menu-item>
            <sl-menu-item>Other Types</sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </div>
      <div class="pageDiv">
        <div class="page">
          <slot></slot>
        </div>
      </div>
    </div>`;
  }

  private _handleSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.isNodeSelected = !!selectElement.value;
  }

  private _addInputToSelectedNode() {
    this.editor.addNodeInput(this.selectedNode.id);

    const event = new CustomEvent("inputCreated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  private _addOutputToSelectedNode() {
    this.editor.addNodeOutput(this.selectedNode.id);

    const event = new CustomEvent("outputCreated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  private _deleteInputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode.id);
    const noOfInputs = Object.keys(node.inputs).length;
    if (noOfInputs != 0) {
      this.editor.removeNodeInput(this.selectedNode.id, `input_${noOfInputs}`);
    }

    const event = new CustomEvent("inputDeleted", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  private _deleteOutputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode.id);
    const noOfOutputs = Object.keys(node.outputs).length;
    if (noOfOutputs != 0) {
      this.editor.removeNodeOutput(
        this.selectedNode.id,
        `output_${noOfOutputs}`
      );
    }

    const event = new CustomEvent("outputDeleted", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  private _connectSelectedNodes() {
    //Get the node to be connected from the sl-select "nodeSelect"
    const nodeToBeConnectedId = this.nodeSelect.value;

    //Add an input to said node and get the input id
    this.editor.addNodeInput(nodeToBeConnectedId);
    const inputs = this.editor.getNodeFromId(nodeToBeConnectedId).inputs;
    const inputKeys = Object.keys(inputs);
    const lastInputKey = inputKeys[inputKeys.length - 1];

    //add output to the selected node and get output id
    this._addOutputToSelectedNode();
    const outputs = this.editor.getNodeFromId(this.selectedNode.id).outputs;
    const outputKeys = Object.keys(outputs);
    const lastOutputKey = outputKeys[outputKeys.length - 1];

    //connect the nodes
    this.editor.addConnection(
      this.selectedNode.id,
      nodeToBeConnectedId,
      lastOutputKey,
      lastInputKey
    );
  }

  private _addQuizBranchNodeToSelectedNode() {
    const data = {
      title: "Quiz Branch",
      question: "",
      answers: [],
    };

    // Create the container div
    const containerDiv = document.createElement("div");

    // Create the icon div
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("div-page-icon");
    iconDiv.innerHTML = PatchQuestion.split(",")[1];
    const svgElement = iconDiv.querySelector("svg");
    if (svgElement) {
      svgElement.classList.add("question-svg");
    }
    iconDiv.appendChild(svgElement);
    containerDiv.appendChild(iconDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    const nameLabel = document.createElement("p");
    nameLabel.textContent = "Quiz";
    contentDiv.appendChild(nameLabel);
    containerDiv.appendChild(contentDiv);

    // Create the icon div
    const threeDotsDiv = document.createElement("div");
    threeDotsDiv.classList.add("div-threedots-icon");
    threeDotsDiv.innerHTML = ThreeDotsVertical;
    const threeDots = threeDotsDiv.querySelector("svg");
    if (threeDots) {
      threeDots.classList.add("threedots-svg");
    }
    threeDotsDiv.appendChild(threeDots);
    containerDiv.appendChild(threeDotsDiv);

    containerDiv.classList.add("container");

    const containerHtml = containerDiv.outerHTML;

    this.editor.addNode(
      "Quiz Branch",
      0,
      0,
      0,
      0,
      "quiz-branch",
      data,
      containerHtml,
      false
    );

    this.editor.addNodeInput(this.createdNodeId);
    const inputs = this.editor.getNodeFromId(this.createdNodeId).inputs;
    const inputKeys = Object.keys(inputs);
    const lastInputKey = inputKeys[inputKeys.length - 1];

    this._addOutputToSelectedNode();
    const outputs = this.editor.getNodeFromId(this.selectedNode.id).outputs;
    const outputKeys = Object.keys(outputs);
    const lastOutputKey = outputKeys[outputKeys.length - 1];

    this.editor.addConnection(
      this.selectedNode.id,
      this.createdNodeId,
      lastOutputKey,
      lastInputKey
    );
  }

  private _resetSelect() {
    if (this.nodeSelect) {
      this.nodeSelect.value = "";
      this.isNodeSelected = false;
    }
  }
}
