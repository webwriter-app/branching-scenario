import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

//Drawflow Imports
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
  SlIcon,
  SlDialog,
} from "@shoelace-style/shoelace";

import { WebWriterConnectionButton } from "./webwriter-connection-button";
import { ToggleableInput } from "./ui-components/toggleable-input";
import { NodeConnectionList } from "./ui-components/node-connection-list";

//Tabler Icon Import
import route2 from "@tabler/icons/outline/route-2.svg";
import squares from "@tabler/icons/filled/squares.svg";

//CSS
import styles from "../css/popup-node-details-css";

@customElement("popup-node-details")
export class PopupNodeDetails extends LitElementWw {
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
      "sl-icon": SlIcon,
      "sl-dialog": SlDialog,
      "webwriter-connection-button": WebWriterConnectionButton,
      "toggleable-input": ToggleableInput,
      "node-connection-list": NodeConnectionList,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @query(".nodeSelect")
  nodeSelect;
  @query("#textAreaHTML")
  textAreaHTML;

  @property({ type: Object }) nodeEditor;

  @property({ type: Boolean }) isNodeSelected = false;

  //public properties are part of the component's public API
  @property({ type: Object, attribute: false }) selectedNode?: DrawflowNode;
  @property({ type: Object, attribute: false }) nodesInEditor = {};

  @property({ type: Function }) _hoverConnection = (string) => {};
  @property({ type: Function }) _unhoverConnection = (string) => {};

  @property({ attribute: false }) changeInEditorCallback = (
    drawflow,
    updateType,
    node?,
    removedNodeId?,
    inputNode?,
    outputNode?,
    inputClass?,
    outputClass?,
    outputHadConnections?
  ) => {};

  protected firstUpdated(_changedProperties: any): void {
    this._resetSelect();
  }

  render() {
    return html` <div class="page-node-details">
      <div class="title-bar">
        <div class="div-icon">
          <sl-icon src=${squares}></sl-icon>
        </div>
        <div class="div-title">
          <!-- <p class="title">${this.selectedNode.data.title}</p> -->
          <toggleable-input
            .text=${this.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggleable-input>
          <p class="subtitle">Page</p>
        </div>

        <div class="last-item">
          <node-connection-list
            input
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.selectedNode}
            ._addOutputToSelectedNode=${() => this._addOutputToSelectedNode()}
            ._deleteOutputFromNode=${(nodeId, outputClass) =>
              this._deleteOutputFromNode(nodeId, outputClass)}
          ></node-connection-list>

          <sl-divider vertical style="height: 70px;"></sl-divider>
          <node-connection-list
            output
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.selectedNode}
            ._addOutputToSelectedNode=${() => this._addOutputToSelectedNode()}
            ._deleteOutputFromNode=${(nodeId, outputClass) =>
              this._deleteOutputFromNode(nodeId, outputClass)}
          ></node-connection-list>
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
        >
          <sl-icon slot="prefix" src="${route2}"></sl-icon>
          Connect</sl-button
        >
      </div>

      <div class="preview">
        <div class="page">
          <div class="overlay">
            <div class="dialog">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /*


  */
  private _handleSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.isNodeSelected = !!selectElement.value;
  }

  /*


  */
  private _addOutputToSelectedNode() {
    this.nodeEditor.editor.addNodeOutput(this.selectedNode.id);
    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputCreated"
    );
  }

  /*
      //TODO: make node preview part of selectednodeviewrenderer
      //TODO: use selects on outputs to redo connections
      //TODO: move quick connect to part options
      //TODO: find error with clear and slots
  */
  private _deleteOutputFromNode(output_id: number, output_class: string) {
    let outputHadConnections =
      (this.nodeEditor.editor.getNodeFromId(output_id) as DrawflowNode).outputs[
        output_class
      ].connections.length != 0;

    this.nodeEditor.editor.removeNodeOutput(output_id, output_class);

    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputDeleted",
      null,
      null,
      null,
      null,
      null,
      output_class,
      outputHadConnections
    );
  }

  /*


  */
  private _connectSelectedNodes() {
    //Get the node to be connected from the sl-select "nodeSelect"
    const nodeToBeConnectedId = this.nodeSelect.value;

    //add output to the selected node and get output id
    this._addOutputToSelectedNode();
    const outputs = this.nodeEditor.editor.getNodeFromId(
      this.selectedNode.id
    ).outputs;
    const outputKeys = Object.keys(outputs);
    const lastOutputKey = outputKeys[outputKeys.length - 1];

    //Use the main input to connect the selected Nodes
    this.nodeEditor.editor.addConnection(
      this.selectedNode.id,
      nodeToBeConnectedId,
      lastOutputKey,
      "input_1"
    );
  }

  /*


  */
  private _resetSelect() {
    if (this.nodeSelect) {
      this.nodeSelect.value = "";
      this.isNodeSelected = false;
    }
  }

  /*


  */
  private renameNode(text: String) {
    this.nodeEditor.editor.updateNodeDataFromId(this.selectedNode.id, {
      ...this.selectedNode.data,
      title: text,
    });

    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "nodeRenamed",
      this.selectedNode.id
    );
  }
}
