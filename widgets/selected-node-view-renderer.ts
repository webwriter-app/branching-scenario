import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { DrawflowNode } from "drawflow";
import { PageNodeDetails } from "./page-node-details";
import { QuizBranchNodeDetails } from "./quiz-branch-node-details";

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

@customElement("node-details-selector")
export class SelectedNodeViewRenderer extends LitElementWw {
  @property({ type: Object, attribute: true }) selectedNode: DrawflowNode =
    NO_NODE_SELECTED;
  @property({ type: Object }) nodeEditor;
  @property({ type: Object, attribute: false }) editorContent;
  @property({ attribute: false }) changeInEditorCallback = (
    drawflow,
    updateType,
    node?,
    removedNodeId?,
    inputNode?,
    outputNode?,
    inputClass?,
    outputClass?
  ) => {};

  static get scopedElements() {
    return {
      "page-node-details": PageNodeDetails,
      "quiz-branch-node-details": QuizBranchNodeDetails,
    };
  }

  //import CSS
  static styles = [styles];

  render() {
    return html`
      <div>
        ${this.selectedNode.class == "page" ||
        this.selectedNode.class == "origin"
          ? html` <div id="selected-node-details">
              <page-node-details
                .nodeEditor="${this.nodeEditor}"
                .nodesInEditor="${this.editorContent.drawflow.Home.data}"
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
                  outputClass
                ) => {
                  this.changeInEditorCallback(
                    drawflow,
                    updateType,
                    node,
                    removedNodeId,
                    inputNode,
                    outputNode,
                    inputClass,
                    outputClass
                  );
                }}
              >
                <slot></slot>
              </page-node-details>
            </div>`
          : this.selectedNode.class == "question-branch"
          ? html` <div id="selected-node-details">
              <quiz-branch-node-details
                .editor="${this.nodeEditor}"
                .nodesInEditor="${this.editorContent.drawflow.Home.data}"
                .selectedNode="${this.selectedNode}"
              >
                <slot></slot>
              </quiz-branch-node-details>
            </div>`
          : html` <div class="no-node-selected">
              <p>Select a node</p>
              <slot></slot>
            </div>`}
      </div>
    `;
  }
}
