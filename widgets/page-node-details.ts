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

import { LinkButton } from "./link-button";

//Bootstrap Icon Import
import Plus from "bootstrap-icons/icons/plus.svg";
import Dash from "bootstrap-icons/icons/dash.svg";
import Journal from "bootstrap-icons/icons/journal.svg";

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
  @property({ type: Object, attribute: false }) gamebook: Gamebook =
    new Gamebook();
  @property({ type: Number }) createdNodeId = null;
  @property({ type: Object, attribute: false }) nodesInEditor = {};

  @queryAssignedElements({ flatten: true, selector: "page-container" })
  pageContainers;

  protected firstUpdated(_changedProperties: any): void {
    this._resetSelect();
    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.createdNodeId = id;
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("selectedNode")) {
      this._resetSelect();
    }
  }

  private _resetSelect() {
    if (this.nodeSelect) {
      this.nodeSelect.value = "";
      this.isNodeSelected = false;
    }
  }

  render() {
    return html`<div id="sheetControls">
      <div class="controls">
        <sl-icon-button src=${Plus} @click=${this._addInputToSelectedNode}>
        </sl-icon-button>
        <sl-icon-button src=${Dash} @click=${this._deleteInputOfSelectedNode}>
        </sl-icon-button>
        <sl-divider vertical style="height: 30px;"></sl-divider>
        <sl-icon-button src=${Plus} @click=${this._addOutputToSelectedNode}>
        </sl-icon-button>
        <sl-icon-button src=${Dash} @click=${this._deleteOutputOfSelectedNode}>
        </sl-icon-button>
        <sl-divider vertical style="height: 30px;"></sl-divider>
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
      <p class="title">${this.selectedNode.data.title}</p>
      <div class="page">
        <slot></slot>
      </div>
    </div>`;
  }

  private _handleSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.isNodeSelected = !!selectElement.value;
  }

  private _addInputToSelectedNode() {
    this.editor.addNodeInput(this.selectedNode.id);
  }

  private _addOutputToSelectedNode() {
    this.editor.addNodeOutput(this.selectedNode.id);
  }

  private _deleteInputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode.id);
    const noOfInputs = Object.keys(node.inputs).length;
    if (noOfInputs != 0) {
      this.editor.removeNodeInput(this.selectedNode.id, `input_${noOfInputs}`);
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
    }
  }

  private _connectSelectedNodes() {
    //Get the node to be connected from the sl-select "nodeSelect"
    const nodeToBeConnectedId = this.nodeSelect.value;
    const nodeToBeConnected = this.editor.getNodeFromId(nodeToBeConnectedId);
    const nodeToBeConnectedTitle = nodeToBeConnected.data.title;

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

    const pageContainer = this.pageContainers.find(
      (pageContainer) =>
        pageContainer.getAttribute("drawflowNodeId") == this.selectedNode.id
    );

    // Create a new SlButton element
    const button = document.createElement("link-button") as LinkButton;
    button.setAttribute("name", nodeToBeConnectedTitle);
    button.setAttribute("dataTargetId", nodeToBeConnectedId);
    pageContainer.appendChild(button);

    this.gamebook.addLinkToPage(this.selectedNode.id, nodeToBeConnectedId);
  }

  private _addQuizBranchNodeToSelectedNode() {
    const data = {
      title: "Quiz Branch",
      question: "",
      answers: [],
    };

    this.editor.addNode(
      "Quiz Branch",
      0,
      0,
      0,
      0,
      "quiz-branch",
      data,
      `
        <div class="title-box">
          <svg id="svg">
            ${Journal}
          </svg>
          <div class="title">Quiz Branch</div>
        </div>
      `,
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
}
