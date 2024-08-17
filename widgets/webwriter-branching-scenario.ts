import { html, css, LitElement, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
} from "lit/decorators.js";

import { SelectedNodeViewRenderer } from "./node-detail-view/selected-node-view-renderer";
import { WebWriterGamebook } from "./gamebook";
import { GamebookContainerManager } from "./gamebook-container-manager";
import { NodeEditor } from "./node-editor/node-editor";
import { DrawflowNode } from "drawflow";
import { QuickConnectNode } from "./ui-components/quick-connect-node";
import { OutputConnectionControl } from "./ui-components/output-connection-control";
import { SplitView } from "./ui-components/split-view";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlInput, SlIcon, SlSplitPanel } from "@shoelace-style/shoelace";

import styles from "../css/webwriter-branching-scenario-css";

import search from "@tabler/icons/outline/search.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import book from "@tabler/icons/outline/book.svg";
import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";

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

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, quiz-container",
  })
  gamebookContainers;

  @query("node-editor") nodeEditor;
  @query("sl-split-panel") splitPanel;
  @query("#widget") widgetDiv;
  @query("selected-node-view-renderer") selectedNodeViewRenderer;

  @property({ type: Object, attribute: true, reflect: true })
  editorContent;
  @property({ type: Number, attribute: true, reflect: true }) editorZoom = -1;
  @property({ type: Object, attribute: true })
  selectedNode: DrawflowNode = NO_NODE_SELECTED;
  @property({ type: String, attribute: true, reflect: true })
  gamebookTitle = "Untitled Gamebook";
  @property({ type: Boolean }) reactToCallbackFromNodeEditor = true;
  @property({ type: Number, attribute: true, reflect: true }) tabIndex = -1;

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "webwriter-gamebook": WebWriterGamebook,
      "gamebook-container-manager": GamebookContainerManager,
      "selected-node-view-renderer": SelectedNodeViewRenderer,
      "node-editor": NodeEditor,
      "quick-connect-node": QuickConnectNode,
      "output-connection-control": OutputConnectionControl,
      "sl-input": SlInput,
      "sl-icon": SlIcon,
      "sl-split-panel": SlSplitPanel,
      "split-view": SplitView,
    };
  }

  private min = "230px";
  private max = "350px";
  private previousSplitPanelHeight;

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
      <!-- <div id="widget"> -->
      <!-- <button @click=${() => this.exportContainersAsString()}></button> -->
      ${this.isContentEditable
        ? html`
              <split-view>
                <node-editor
                  slot="start"
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
                    outputHadConnections,
                    importedGamebookContainers
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
                      outputHadConnections,
                      importedGamebookContainers
                    );
                  }}
                  .updateSelectedNodeCallback=${(id) => {
                    this.updateSelectedNode(id);
                  }}
                  .gamebookTitle=${this.gamebookTitle}
                  .handleGamebookTitle=${(event) =>
                    this.handleGamebookTitle(event)}
                >
                </node-editor>
                <selected-node-view-renderer
                  slot="end"
                  .selectedNode=${this.selectedNode}
                  .nodeEditor=${this.nodeEditor}
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
                    .editorContent=${this.editorContent}
                    .getNodeEditor=${() => this.getNodeEditor()}
                    .appendToShadowDom=${(container) =>
                      this._addContainerCallback(container)}
                  >
                    <slot></slot>
                  </gamebook-container-manager>
                </selected-node-view-renderer>
              </split-view>
        
              <div part="options" class="author-only">
                <div>
                  <sl-icon src=${book} slot="prefix"></sl-icon>
                  <p>Gamebook</p>
                </div>
                <sl-input
                  placeholder="Search nodes"
                  style="padding-bottom: 15px"
                >
                  <sl-icon src=${search} slot="prefix"></sl-icon>
                </sl-input>
                ${
                  this.selectedNode.id != -1
                    ? html`<div style="margin-left: 25px">
                          ${this.selectedNode.class == "page" ||
                          this.selectedNode.class == "origin"
                            ? html`<sl-icon src=${file}></sl-icon>`
                            : this.selectedNode.class == "popup"
                            ? html`<sl-icon src=${squares}></sl-icon>`
                            : this.selectedNode.class == "branch"
                            ? html`<sl-icon src=${arrowsSplit2}></sl-icon>`
                            : null}
                          <p>${this.selectedNode.data.title}</p>
                        </div>
                        <p style="margin-left: auto">
                          Internal ID: ${this.selectedNode.id}
                        </p>
                        <p style="margin-left: auto">
                          Container found:
                          ${this.gamebookContainerManager._getContainerByDrawflowNodeId(
                            this.selectedNode.id
                          ) != undefined}
                        </p>
                        <quick-connect-node
                          style="margin-left: 25px"
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
                        ></quick-connect-node> `
                    : null
                }
              </div>
            </div>
          `
        : html`<webwriter-gamebook
            gamebookTitle=${this.gamebookTitle != ""
              ? this.gamebookTitle
              : "Untitled Gamebook"}
            ><slot></slot
          ></webwriter-gamebook>`}
      <!-- </div> -->
    `;
  }

  /*


  */
  private exportContainersAsString() {
    console.log(
      JSON.stringify(this.gamebookContainers, this.domElementReplacer)
    );
  }

  /*

  */
  private domElementReplacer(key, value) {
    if (value instanceof HTMLElement) {
      return {
        tagName: value.tagName,
        attributes: [...value.attributes].map((attr) => ({
          name: attr.name,
          value: attr.value,
        })),
        innerHTML: value.innerHTML,
      };
    }
    return value;
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
    outputHadConnections?: Boolean,
    importedGamebookContainers?: Array<Object>
  ) {
    //
    if (updateType == "nodeRenamed") {
      this.updateSelectedNode(this.selectedNode.id.toString());
      this.gamebookContainerManager._renameContainer(
        node.id.toString(),
        this.selectedNode.data.title
      );
    }
    //
    // else if (updateType == "selectedNodeDataChanged") {
    //   this.updateSelectedNode(this.selectedNode.id.toString());

    //   if (node.class == "question-branch") {
    //     this.gamebookContainerManager
    //       ._getContainerByDrawflowNodeId(node.id)
    //       .updateFromQuestionNode(this.selectedNode);
    //   }
    // }
    //
    else if (updateType == "nodeCreated") {
      this.updateSelectedNode(this.selectedNode.id.toString());
      if (node.class == "page" || node.class == "origin") {
        this.gamebookContainerManager._createPageContainerFromPageNode(node);
        //console.log(this.gamebookContainerManager.gamebookContainers);
      }
      //
      else if (node.class == "popup") {
        this.gamebookContainerManager._createPopupContainerFromPopupNode(node);
      }
      //
      else if (node.class == "question-branch") {
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
      console.log("connection Created'");
      this.gamebookContainerManager.addConnectionButtonToContainer(
        outputNode,
        inputNode,
        outputClass,
        inputClass
      );
    }

    //
    else if (updateType == "connectionRemoved") {
      //if a connection is removed by the user, remove the corresponding button
      if (this.reactToCallbackFromNodeEditor) {
        console.log(
          "connection delete",
          outputNode.id,
          outputClass,
          inputNode.id,
          inputClass
        );
        const identifier = `${outputNode.id}-${outputClass}-${inputNode.id}-${inputClass}`;
        this.gamebookContainerManager.removeConnectionButtonFromContainer(
          outputNode.id,
          identifier
        );
      }
      //if a button was removed by the user
      else {
        this.reactToCallbackFromNodeEditor = true;
      }
    }
    //
    else if (updateType == "connectionHighlighted") {
      //
      //
      if (this.reactToCallbackFromNodeEditor) {
        const identifier = `${outputNode.id}-${outputClass}-${inputNode.id}-${inputClass}`;

        this.gamebookContainerManager.highlightConnectionButtonInContainer(
          this.selectedNode.id,
          identifier
        );
      } else {
        this.reactToCallbackFromNodeEditor = true;
      }
    }

    //
    else if (updateType == "connectionUnhighlighted") {
      //
      //
      if (this.reactToCallbackFromNodeEditor) {
        const identifier = `${outputNode.id}-${outputClass}-${inputNode.id}-${inputClass}`;

        this.gamebookContainerManager.unhighlightConnectionButtonInContainer(
          this.selectedNode.id,
          identifier
        );
      } else {
        this.reactToCallbackFromNodeEditor = true;
      }
    }
    //
    else if (updateType == "editorCleared") {
      this.gamebookContainerManager._deleteAllGamebookContainers();
      this.updateSelectedNode("-1");

      //console.log(this.gamebookContainerManager.gamebookContainers);
    }
    //
    else if (updateType == "outputCreated") {
      this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "outputDeleted") {
      console.log("here before", "deleted output", outputClass);
      //Updat the Connection Button Id's only if the output had no connection, because connection removal also updates conneciton button ids
      //if (!outputHadConnections) {
      this.gamebookContainerManager.updateConnectionButtonIdsAfterRemove(
        this.selectedNode.id,
        outputClass
      );
      //}

      this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "templateImported") {
      console.log(importedGamebookContainers);
      this.gamebookContainerManager.importContainers(
        importedGamebookContainers
      );
    }

    this.editorContent = drawflow;
    this.requestUpdate();
  }

  private getNodeEditor() {
    return this.nodeEditor;
  }

  /*


  */
  private handleChangesInGamebookContainers() {
    this.addEventListener("containerDeleteConnectionButton", (event) => {
      //if a button is removed, remove the corresponding connection
      const identifier = (event as CustomEvent).detail.identifier;
      const parsed = this.parseConnectionIdentifier(identifier);

      this.nodeEditor.editor.removeSingleConnection(
        parsed.outputNodeId,
        parsed.inputNodeId,
        parsed.outputClass,
        parsed.inputClass
      );

      this.editorContent = { ...this.nodeEditor.editor.drawflow };
      this.updateSelectedNode(this.selectedNode.id.toString());
    });
    this.addEventListener("containerHighlightConnectionButton", (event) => {
      this.reactToCallbackFromNodeEditor = false;
      this.nodeEditor.highlightConnectionAndNode(
        (event as CustomEvent).detail.outputNodeId,
        (event as CustomEvent).detail.inputNodeId,
        (event as CustomEvent).detail.outputClass,
        (event as CustomEvent).detail.inputClass,
        (event as CustomEvent).detail.highlightNode
      );
    });
    this.addEventListener("containerUnhighlightConnectionButton", (event) => {
      this.reactToCallbackFromNodeEditor = false;
      this.nodeEditor.unhighlightConnectionAndNode(
        (event as CustomEvent).detail.outputNodeId,
        (event as CustomEvent).detail.inputNodeId,
        (event as CustomEvent).detail.outputClass,
        (event as CustomEvent).detail.inputClass,
        (event as CustomEvent).detail.highlightNode
      );
    });
  }

  /*


  */
  private updateSelectedNode(id: String) {
    if (id != "-1") {
      this.selectedNode = { ...this.nodeEditor.editor.getNodeFromId(id) };

      if (
        this.selectedNode.class == "page" ||
        this.selectedNode.class == "origin" ||
        this.selectedNode.class == "popup"
      ) {
        this.gamebookContainerManager._showGamebookContainerById(
          this.selectedNode.id
        );
      }
      //
      else if (this.selectedNode.class == "question-branch") {
        this.gamebookContainerManager._hideAllGamebookContainers();
      }
    } else {
      this.selectedNode = { ...NO_NODE_SELECTED };
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
  private _addContainerCallback(container: Node) {
    this.appendChild(container);
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
}
