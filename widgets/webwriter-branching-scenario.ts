import { html, css, LitElement } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
} from "lit/decorators.js";

import { SelectedNodeViewRenderer } from "./selected-node-view-renderer";
import { WebWriterGamebook } from "./gamebook";
import { GamebookContainerManager } from "./gamebook-container-manager";
import { NodeEditor } from "./node-editor";
import { DrawflowNode } from "drawflow";
import styles from "../css/webwriter-branching-scenario-css";

const NO_CONNECTION_SELECTED = "output_id-output_class-input_id-input_class";
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

@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  @query("gamebook-container-manager")
  gamebookContainerManager;
  @query("node-editor") nodeEditor;
  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-page-container, quiz-container",
  })
  gamebookContainers;

  @property({ type: Object, attribute: true, reflect: true }) editorContent;
  @property({ type: Number, attribute: true, reflect: true }) editorZoom = -1;
  @property({ type: Object, attribute: true })
  selectedNode: DrawflowNode = NO_NODE_SELECTED;
  @property({ type: String, attribute: true, reflect: true })
  gamebookTitle = "Untitled Gamebook";
  @property({ type: Boolean }) reactToChanges = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    //delegatesFocus: true,
  };

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "webwriter-gamebook": WebWriterGamebook,
      "gamebook-container-manager": GamebookContainerManager,
      "selected-node-view-renderer": SelectedNodeViewRenderer,
      "node-editor": NodeEditor,
    };
  }

  //import CSS
  static styles = [styles];

  /*
  
  */
  protected firstUpdated(_changedProperties: any): void {
    this.updateSelectedNode("-1");
    this.gamebookContainers.forEach((container) => {
      container.hide();
    });
    this.handleChangesInGamebookContainers();
  }

  /*
  
  */
  render() {
    return html`
      <div id="widget">
        ${this.isContentEditable
          ? html`
              <node-editor
                .selectedNode=${this.selectedNode}
                .editorContent=${this.editorContent}
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
                  this.updateGamebookContainers(
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
                .updateSelectedNodeCallback=${(id) => {
                  this.updateSelectedNode(id);
                }}
                .gamebookTitle=${this.gamebookTitle}
                .handleGamebookTitle=${(event) =>
                  this.handleGamebookTitle(event)}
              ></node-editor>
              <selected-node-view-renderer
                .selectedNode=${this.selectedNode}
                .nodeEditor=${this.nodeEditor}
                .editorContent=${this.editorContent}
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
                  this.updateGamebookContainers(
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
                <gamebook-container-manager
                  .appendToShadowDom=${(container) =>
                    this._addContainerCallback(container)}
                >
                  <slot></slot>
                </gamebook-container-manager>
              </selected-node-view-renderer>
            `
          : html`<webwriter-gamebook
              gamebookTitle=${this.gamebookTitle != ""
                ? this.gamebookTitle
                : "Untitled Gamebook"}
              ><slot></slot
            ></webwriter-gamebook>`}
      </div>
    `;
  }

  /*


  */
  private updateGamebookContainers(
    drawflow: Object,
    updateType: String,
    node?: DrawflowNode,
    removedNodeId?: String,
    inputNode?: DrawflowNode,
    outputNode?: DrawflowNode,
    inputClass?: String,
    outputClass?: String,
    outputHadConnections?: Boolean
  ) {
    this.editorContent = drawflow;

    //
    if (updateType == "nodeRenamed") {
      this.updateSelectedNode(this.selectedNode.id.toString());
      this.gamebookContainerManager._renameContainer(
        node.id.toString(),
        this.selectedNode.data.title
      );
    }
    //
    else if (updateType == "selectedNodeDataChanged") {
      this.updateSelectedNode(this.selectedNode.id.toString());

      if (node.class == "question-branch") {
        this.gamebookContainerManager
          ._getContainerByDrawflowNodeId(node.id)
          .updateFromQuestionNode(this.selectedNode);
      }
    }
    //
    else if (updateType == "nodeCreated") {
      if (node.class == "page" || node.class == "origin") {
        this.gamebookContainerManager._createPageContainerFromPageNode(node);
      } else if (node.class == "question-branch") {
        this.gamebookContainerManager._createQuestionContainerFromQuestionNode(
          node
        );
      }
    }
    //
    else if (updateType == "nodeRemoved") {
      this.gamebookContainerManager._deleteGamebookContainersById(
        removedNodeId
      );
    }
    //
    else if (updateType == "connectionCreated") {
      if (outputNode.class == "page" || outputNode.class == "origin") {
        const pageContainer =
          this.gamebookContainerManager._getContainerByDrawflowNodeId(
            outputNode.id
          );
        pageContainer.addConnectionButtonToPageContainer(
          outputNode,
          inputNode,
          outputClass,
          inputClass
        );
      } else if (outputNode.class == "question-branch") {
        this._updateQuestionNodeAnswerTarget(
          outputNode,
          outputClass.toString(),
          inputNode.id.toString()
        );
      }
    }
    //
    else if (updateType == "connectionRemoved") {
      //if a connection is removed by the user, remove the corresponding button
      if (this.reactToChanges) {
        if (outputNode.class == "page" || outputNode.class == "origin") {
          console.log("deletes connection button");
          const pageContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              outputNode.id
            );
          const identifier = `${outputNode.id}-${outputClass}-${inputNode.id}-input_1`;
          pageContainer.removeConnectionButtonFromPageContainer(identifier);
        }
        //
        else if (outputNode.class == "question-branch") {
          this._updateQuestionNodeAnswerTarget(
            outputNode,
            outputClass.toString(),
            "undefined"
          );
        }
      }
      //if a button was removed by the user
      else {
        this.reactToChanges = true;
      }
    }
    //
    else if (updateType == "editorCleared") {
      this.gamebookContainerManager._deleteAllGamebookContainers();
      this.updateSelectedNode("-1");
    }
    //
    else if (updateType == "outputCreated") {
      this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "outputDeleted") {
      console.log("callback output deleted");
      const pageContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          this.selectedNode.id
        );

      //Updat the Connection Button Id's only if the output had no connection, because connection removal also updates conneciton button ids
      if (!outputHadConnections) {
        pageContainer.updateConnectionButtonIds(outputClass);
      }

      this.updateSelectedNode(this.selectedNode.id.toString());
    }
  }

  /*


  */
  private handleChangesInGamebookContainers() {
    this.addEventListener("userDeleteConnectionButton", (event) => {
      //if a button is removed, remove the corresponding connection
      this.reactToChanges = false;
      const { outputNodeId, outputClass, inputNodeId, inputClass } =
        this.parseConnectionIdentifier(
          (event as CustomEvent).detail.identifier
        );

      this.nodeEditor.editor.removeNodeOutput(outputNodeId, outputClass);
      const pageContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          outputNodeId
        );
      pageContainer.updateConnectionButtonIds(outputClass);

      this.editorContent = { ...this.nodeEditor.editor.drawflow };
      this.updateSelectedNode(this.selectedNode.id.toString());
    });
  }

  /*


  */
  private updateSelectedNode(id: String) {
    //console.log("update Selected Node to", id);
    if (id != "-1") {
      this.selectedNode = this.nodeEditor.editor.getNodeFromId(id);
      //console.log(this.nodeEditor.editor.getNodeFromId(this.selectedNode.id));
      if (
        this.selectedNode.class == "page" ||
        this.selectedNode.class == "origin"
      ) {
        this.gamebookContainerManager._showGamebookContainerById(
          this.selectedNode.id
        );
      } else if (this.selectedNode.class == "question-branch") {
        this.gamebookContainerManager._hideAllGamebookContainers();
      }
    } else {
      this.selectedNode = NO_NODE_SELECTED;
      this.gamebookContainerManager._hideAllGamebookContainers();
    }
  }

  /*


  */
  private handleGamebookTitle(event) {
    this.gamebookTitle = event.target.value;
  }

  /*

  */
  private parseConnectionIdentifier(identifier) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      outputClass: parts[1],
      inputNodeId: parseInt(parts[2]),
      inputClass: parts[3],
    };

    return parsed;
  }

  /*

  */
  private _addContainerCallback(container: Node) {
    this.appendChild(container);
  }

  /*


  */
  private _updateQuestionNodeAnswerTarget(
    quizNode: DrawflowNode,
    answer_output_class: string,
    target_node_id: string
  ) {
    const index = Object.keys(quizNode.outputs).indexOf(answer_output_class);

    if (index !== -1) {
      quizNode.data.answers[index].targetPageId = target_node_id;

      this.nodeEditor.editor.updateNodeDataFromId(quizNode.id, {
        ...quizNode.data,
        answers: quizNode.data.answers,
      });

      this.dispatchEvent(
        new CustomEvent("nodeDataUpdated", {
          detail: { nodeId: quizNode.id },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}
