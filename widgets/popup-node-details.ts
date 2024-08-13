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
import { QuickConnectNode } from "./ui-components/quick-connect-node";

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
      "quick-connect-node": QuickConnectNode,
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
}
