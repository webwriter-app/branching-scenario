import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { DrawflowNode } from "drawflow";
import { PageNodeDetails } from "./page-node-details";
import { QuizBranchNodeDetails } from "./quiz-branch-node-details";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon, SlDivider } from "@shoelace-style/shoelace";

// Declare global variable of type DrawflowNode
const NO_NODE_SELECTED: DrawflowNode = {
  id: -1,
  name: "unselect",
  inputs: {},
  outputs: {},
  pos_x: 0,
  pos_y: 0,
  class: "unselect",
  data: {},
  html: "",
  typenode: false,
};

//Import Styles
import styles from "../css/selected-node-details-css";
import { PopupNodeDetails } from "./popup-node-details";
import { ToggleableInput } from "./ui-components/toggleable-input";
import { NodeConnectionList } from "./ui-components/node-connection-list";

//Tabler Icon Import
import squares from "@tabler/icons/filled/squares.svg";
import file from "@tabler/icons/filled/file.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";

@customElement("node-details-selector")
export class SelectedNodeViewRenderer extends LitElementWw {
  @property({ type: Object, attribute: true, reflect: false })
  selectedNode: DrawflowNode = NO_NODE_SELECTED;
  @property({ type: Object }) nodeEditor;
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

  static get scopedElements() {
    return {
      "page-node-details": PageNodeDetails,
      "popup-node-details": PopupNodeDetails,
      "quiz-branch-node-details": QuizBranchNodeDetails,
      "toggleable-input": ToggleableInput,
      "node-connection-list": NodeConnectionList,
      "sl-icon": SlIcon,
      "sl-divider": SlDivider,
    };
  }

  //import CSS
  static styles = [styles];

  render() {
    return html`
      ${this.selectedNode.id !== -1
        ? html` <div class="title-bar">
              ${this.selectedNode.class == "page" ||
              this.selectedNode.class == "origin"
                ? html`
                    <div class="div-icon-page">
                      <sl-icon src=${file}></sl-icon>
                    </div>
                  `
                : this.selectedNode.class == "popup"
                ? html`<div class="div-icon-popup">
                    <sl-icon src=${squares}></sl-icon>
                  </div>`
                : this.selectedNode.class == "branch"
                ? html`<div class="div-icon-branch">
                    <sl-icon src=${arrowsSplit2}></sl-icon>
                  </div>`
                : null}
              <div class="div-title">
                <!-- <p class="title">${this.selectedNode.data.title}</p> -->
                <toggleable-input
                  .text=${this.selectedNode.data.title}
                  .saveChanges=${(string) => this.renameNode(string)}
                ></toggleable-input>
                ${this.selectedNode.class == "page" ||
                this.selectedNode.class == "origin"
                  ? html` <p class="subtitle">Page</p> `
                  : this.selectedNode.class == "popup"
                  ? html`<p class="subtitle">Popup</p>`
                  : this.selectedNode.class == "branch"
                  ? html`<p class="subtitle">Smart Branch</p>`
                  : null}
              </div>
              <div class="inputOutputControls">
                <node-connection-list
                  input
                  .nodeEditor=${this.nodeEditor}
                  .selectedNode=${this.selectedNode}
                  .changeInEditorCallback=${(
                    drawflow,
                    updateType,
                    node,
                    removedNodeId,
                    inputNode,
                    outputNode,
                    inputClass,
                    outputClass,
                    outputHadConnections
                  ) => {
                    this.changeInEditorCallback(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    );
                  }}
                ></node-connection-list>
                <sl-divider vertical style="height: 100%;"></sl-divider>
                <node-connection-list
                  output
                  .nodeEditor=${this.nodeEditor}
                  .selectedNode=${this.selectedNode}
                  .changeInEditorCallback=${(
                    drawflow,
                    updateType,
                    node,
                    removedNodeId,
                    inputNode,
                    outputNode,
                    inputClass,
                    outputClass,
                    outputHadConnections
                  ) => {
                    this.changeInEditorCallback(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    );
                  }}
                ></node-connection-list>
              </div>
            </div>
            ${this.selectedNode.class == "page" ||
            this.selectedNode.class == "origin"
              ? html`
                  <page-node-details
                    .nodeEditor="${this.nodeEditor}"
                    .selectedNode="${this.selectedNode}"
                    .selectedNodeId="${this.selectedNode.id}"
                    .changeInEditorCallback=${(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    ) => {
                      this.changeInEditorCallback(
                        drawflow,
                        updateType,
                        node,
                        removedNodeId,
                        inputNode,
                        outputNode,
                        inputClass,
                        outputClass,
                        outputHadConnections
                      );
                    }}
                  >
                    <slot></slot>
                  </page-node-details>
                `
              : this.selectedNode.class == "question-branch"
              ? html` <div id="selected-node-details">
                  <slot></slot>
                </div>`
              : this.selectedNode.class == "popup"
              ? html`
                  <popup-node-details
                    .nodeEditor="${this.nodeEditor}"
                    .selectedNode="${this.selectedNode}"
                    .selectedNodeId="${this.selectedNode.id}"
                    .changeInEditorCallback=${(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    ) => {
                      this.changeInEditorCallback(
                        drawflow,
                        updateType,
                        node,
                        removedNodeId,
                        inputNode,
                        outputNode,
                        inputClass,
                        outputClass,
                        outputHadConnections
                      );
                    }}
                  >
                    <slot></slot>
                  </popup-node-details>
                `
              : null}`
        : html`
            <div class="no-node-selected">
              <p>Click on a node to view its content</p>
              <slot></slot>
            </div>
          `}
    `;
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
      this.selectedNode
    );
  }
}
