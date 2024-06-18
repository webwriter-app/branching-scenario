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
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js";
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";

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

//TODO: use slots to have actual webwriter editing capabilities
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
        <!-- TODO: This does not reset since page-node-details is always in the DOM but made hidden over CSS -->
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
          <sl-button slot="trigger">Add Branch</sl-button>
          <sl-menu>
            <sl-menu-item
              @click=${() => this._addQuizBranchNodeToSelectedNode()}
              >Quiz Branch</sl-menu-item
            >
            <sl-menu-item>Reactive Branch</sl-menu-item>
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
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
  }

  private _addOutputToSelectedNode() {
    this.editor.addNodeOutput(this.selectedNode.id);
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
    //TODO: somehow this does not update the output count when a connection is added via button press
  }

  private _deleteInputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode.id);
    const noOfInputs = Object.keys(node.inputs).length;
    if (noOfInputs != 0) {
      this.editor.removeNodeInput(this.selectedNode.id, `input_${noOfInputs}`);
      this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
    }
  }

  private _deleteOutputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode.id);
    const noOfOutputs = Object.keys(node.outputs).length;
    if (noOfOutputs != 0) {
      this.editor.removeNodeOutput(
        this.selectedNode.id,
        `output_${noOfOutputs}`
      );
      this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
    }
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
    iconDiv.innerHTML = PatchQuestion;
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
