import { html, css, LitElement, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  state,
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
import {
  SlInput,
  SlIcon,
  SlSplitPanel,
  SlDialog,
  SlButton,
  SlSwitch,
  SlSelect,
} from "@shoelace-style/shoelace";

import styles from "../css/webwriter-branching-scenario-css";

import search from "@tabler/icons/outline/search.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import book from "@tabler/icons/outline/book.svg";
import packages from "@tabler/icons/outline/packages.svg";

import infoSquareRounded from "@tabler/icons/filled/info-square-rounded.svg";
import { WebWriterGamebookPageContainer } from "./gamebook-components/webwriter-gamebook-page-container";
import { NodeEditorControlsBar } from "./node-editor/node-editor-control-bar";
import { WebWriterGamebookPopupContainer } from "./gamebook-components/webwriter-gamebook-popup-container";
import { WebWriterGamebookBranchContainer } from "./gamebook-components/webwriter-gamebook-branch-container";

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
  @query("gamebook-container-manager") accessor gamebookContainerManager;

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, webwriter-gamebook-branch-container",
  })
  accessor gamebookContainers;

  @query("node-editor") accessor nodeEditor;
  @query("sl-split-panel") accessor splitPanel;
  @query("#widget") accessor widgetDiv;
  @query("selected-node-view-renderer") accessor selectedNodeViewRenderer;
  @query("#searchInput") accessor searchInput;

  @property({ type: Object, attribute: true, reflect: true })
  accessor editorContent;
  @property({ type: Object, attribute: true })
  accessor selectedNode: DrawflowNode = NO_NODE_SELECTED;
  @property({ type: Object, attribute: true })
  accessor copiedNode: DrawflowNode = NO_NODE_SELECTED;
  @property({ type: Number, attribute: true }) accessor numberOfSearchNodes = 0;
  @property({ type: String, attribute: true, reflect: true })
  accessor gamebookTitle = "Untitled Gamebook";
  @property({ type: Boolean }) accessor reactToCallbackFromNodeEditor = true;
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;
  @property({ type: Number, attribute: true, reflect: true })
  accessor dividerPos = 350;
  @property({ type: Number, attribute: true, reflect: true })
  accessor editorZoom = -1;
  @property({ type: Object, attribute: true, reflect: true })
  accessor editorPosition = { x: undefined, y: undefined };

  @state() accessor inPreviewMode = false;
  @property({ type: Number, attribute: true, reflect: false })
  accessor startContainerIdPreview = undefined;

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "webwriter-gamebook": WebWriterGamebook,
      "gamebook-container-manager": GamebookContainerManager,
      "selected-node-view-renderer": SelectedNodeViewRenderer,
      "node-editor": NodeEditor,
      "node-editor-controls-bar": NodeEditorControlsBar,
      "quick-connect-node": QuickConnectNode,
      "output-connection-control": OutputConnectionControl,
      "sl-input": SlInput,
      "sl-icon": SlIcon,
      "sl-split-panel": SlSplitPanel,
      "split-view": SplitView,
      "sl-dialog": SlDialog,
      "sl-button": SlButton,
      "sl-switch": SlSwitch,
      "sl-select": SlSelect,
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

    const dialog = this.shadowRoot.getElementById(
      "branch_input_full_dialog"
    ) as SlDialog;

    // Prevent the dialog from closing when the user clicks on the overlay
    dialog.addEventListener("sl-request-close", (event) => {
      if (event.detail.source === "overlay") {
        event.preventDefault();
      }
    });

    // this.addEventListener("switchToPreviewMode", (event) => {
    //   this.switchToPreviewMode((event as CustomEvent).detail.startFrom);
    // });

    // this.addEventListener("switchToNodeEditor", (event) => {
    //   this.switchToNodeEditor();
    // });
  }

  /*
  
  */
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._handleKeydown);
  }
  /*
  
  */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._handleKeydown);
  }

  /*
  
  */
  private _handleKeydown = (event: KeyboardEvent) => {
    // Check if CMD (Mac) or CTRL (Windows/Linux) and F key is pressed
    if ((event.metaKey || event.ctrlKey) && event.key === "f") {
      event.preventDefault(); // Prevent the default browser find functionality
      this.searchInput.focus(); // Focus the sl-input element
    }
    //
    else if ((event.metaKey || event.ctrlKey) && event.key === "c") {
      event.preventDefault(); // Prevent the default browser find functionality
      this.copyNode();
    }
    //
    else if ((event.metaKey || event.ctrlKey) && event.key === "v") {
      event.preventDefault(); // Prevent the default browser find functionality
      this.pasteNode();
    }
  };

  /*
  
  */
  render() {
    return html`
      <!-- <div id="widget"> -->
      <!-- <button @click=${() => this.exportContainersAsString()}></button> -->
      ${this.isContentEditable
        ? html`
           <split-view .getDividerPos=${(pos) => this.serializeDividerPos(pos)} 
                .dividerPosition=${this.dividerPos} >
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
                    importedGamebookContainers,
                    zoom,
                    translate,
                    changeOrigin
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
                      importedGamebookContainers,
                      zoom,
                      translate,
                      changeOrigin
                    );
                  }}
                  .updateSelectedNodeCallback=${(id) => {
                    this.updateSelectedNode(id);
                  }}
                  .gamebookTitle=${this.gamebookTitle}
                  .handleGamebookTitle=${(event) =>
                    this.handleGamebookTitle(event)}
                  .editorZoom=${this.editorZoom}
                  .editorPosition=${this.editorPosition}
                  .markUsedOutputs=${() => this._markUsedOutputs()}
                  .checkIfElseRuleTargetIsSet=${() =>
                    this.checkIfElseRuleTargetIsSet()}
                >
                </node-editor>
                <selected-node-view-renderer
                  slot="end"
                  .selectedNode=${this.selectedNode}
                  .nodeEditor=${this.nodeEditor}
                   .markUsedOutputs=${() => this._markUsedOutputs()}
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
                  id="searchInput"
                  placeholder="Search for nodes, types, and content"
                  style="padding-bottom: 15px"
                  clearable
                  help-text=${
                    this.numberOfSearchNodes == 0
                      ? ""
                      : this.numberOfSearchNodes == 1
                      ? `${this.numberOfSearchNodes} node found`
                      : this.numberOfSearchNodes > 1
                      ? `${this.numberOfSearchNodes} nodes found`
                      : ""
                  }
                  @sl-input=${this._handleNodeSearch}
                >
                  <sl-icon src=${search} slot="prefix"></sl-icon>
                </sl-input>
               <sl-button 
                  @click=${() => this.pasteNode()}
                  ?disabled=${this.copiedNode.id === -1}>
                  Paste Node
                </sl-button>

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

                        <sl-button id="copyNodeBtn" @click=${this.copyNode}
                          >Copy Node</sl-button
                        >
                        <sl-button
                          id="deleteNodeBtn"
                          @click=${() =>
                            (
                              this.shadowRoot.getElementById(
                                "delete_node_dialog"
                              ) as SlDialog
                            ).show()}
                          variant="danger"
                          outline
                          ?disabled=${this.selectedNode.class == "origin"
                            ? true
                            : false}
                          >Delete Node</sl-button
                        >
                        ${this.selectedNode.class == "page" ||
                        this.selectedNode.class == "origin"
                          ? html` <sl-button
                              id="makeNodeOriginBtn"
                              @click=${() =>
                                this.makeNodeOrigin(this.selectedNode.id)}
                              ?disabled=${this.selectedNode.class == "origin"
                                ? true
                                : false}
                              >Make Page Origin</sl-button
                            >`
                          : null}
                        ${this.selectedNode.class == "branch"
                          ? html`
                              <sl-icon src=${infoSquareRounded}></sl-icon>
                              <p>
                                Set up conditions to determine how your gamebook
                                will continue. The first condition that is met
                                will be taken. Rearrange the conditions to
                                determine the order.
                              </p>
                              <sl-icon src=${packages}></sl-icon>
                              <p>
                                Made to work with the WebWriter Quiz Widget.
                                Available over packages!
                              </p>
                            `
                          : null}
                        ${this.selectedNode.class == "popup"
                          ? html`
                              <!-- Get gamebook container manager here and get the container with the matching id, tie attributes directly to the container and let it be controlled here-->
                              <sl-switch
                                ?checked=${(
                                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                                    this.selectedNode.id
                                  ) as WebWriterGamebookPopupContainer
                                )?.preventClosing}
                                @sl-input=${(event) =>
                                  this.handleSwitchPreventClosing(event)}
                                >Prevent Closing</sl-switch
                              >
                              <sl-switch
                                ?checked=${(
                                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                                    this.selectedNode.id
                                  ) as WebWriterGamebookPopupContainer
                                )?.noHeader
                                  ? false
                                  : true}
                                @sl-input=${(event) =>
                                  this.handleSwitchNoHeader(event)}
                                >Header</sl-switch
                              >
                            `
                          : null} `
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
      <sl-dialog
        label="Only one connection allowed!"
        class="dialog"
        id="branch_input_full_dialog"
      >
        Smart Branch Nodes allow only one connection.
        <sl-button
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (
              this.shadowRoot.getElementById(
                "branch_input_full_dialog"
              ) as SlDialog
            ).hide()}
          >Understood</sl-button
        >
      </sl-dialog>

      <sl-dialog label="Delete node" class="dialog" id="delete_node_dialog">
        You are about to delete the node "${this.selectedNode.data.title}". Do
        you want to proceed?
        <sl-button
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (
              this.shadowRoot.getElementById("delete_node_dialog") as SlDialog
            ).hide()}
          >Abort</sl-button
        >
        <sl-button
          slot="footer"
          variant="danger"
          outline
          @click=${this.deleteSelectedNode}
          >Delete</sl-button
        >
      </sl-dialog>
    `;
  }

  /*


  */
  private copyNode() {
    this.copiedNode = this.selectedNode;
  }

  /*


  */
  private pasteNode() {
    if (this.copiedNode.id != -1) {
      this.nodeEditor.pasteNode(this.copiedNode);
    }
  }

  /*


  */
  private copyAndPasteContainerContents(copiedContainerId, pastedContainerId) {
    const pastedContainer =
      this.gamebookContainerManager._getContainerByDrawflowNodeId(
        pastedContainerId
      );
    const copiedContainer =
      this.gamebookContainerManager._getContainerByDrawflowNodeId(
        copiedContainerId
      );

    // Iterate through each element in copiedContainer's slotContent
    copiedContainer.slotContent.forEach((element) => {
      // Skip elements with specific tag names
      if (
        element.tagName.toLowerCase() === "webwriter-connection-button" ||
        element.tagName.toLowerCase() === "webwriter-smart-branch-button"
      ) {
        return; // Skip this element
      }

      // Create a new element of the same type
      const newElement = document.createElement(element.tagName);

      // Manually copy desired attributes, skipping 'id'
      [...element.attributes].forEach((attr) => {
        if (attr.name !== "id" && attr.name !== "contenteditable") {
          // Skip the 'id' attribute
          newElement.setAttribute(attr.name, attr.value);
        }
      });

      // Copy inner content (text or children) if necessary
      newElement.innerHTML = element.innerHTML; // or use another approach based on your needs

      // Append the new element to pastedContainer's slot
      pastedContainer.appendChild(newElement);
    });
  }
  /*


  */
  private exportContainersAsString() {
    // console.log(
    //   JSON.stringify(this.gamebookContainers, this.domElementReplacer)
    // );
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
  TODO: redo the logic for creationg and deletion of connections and buttons.
  TODO: bug test this!
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
    importedGamebookContainers?: Array<Object>,
    zoom?: Number,
    translate?: { x: number; y: number },
    changeOrigin?: { oldId: number; newId: number }
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
    else if (updateType == "customNodeDataChanged") {
      this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "nodeCreated") {
      this.focus();
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
      else if (node.class == "branch") {
        //console.log("branch node created");
        this.gamebookContainerManager._createBranchContainer(node);
      }
    }
    //
    else if (updateType == "nodePasted") {
      this.updateSelectedNode(this.selectedNode.id.toString());
      if (node.class == "page" || node.class == "origin") {
        this.gamebookContainerManager._createPageContainerFromPageNode(node);
        this.copyAndPasteContainerContents(this.copiedNode.id, node.id);
        //this.copiedNode = NO_NODE_SELECTED;
      }
      //
      else if (node.class == "popup") {
        this.gamebookContainerManager._createPopupContainerFromPopupNode(node);
        this.copyAndPasteContainerContents(this.copiedNode.id, node.id);
        //this.copiedNode = NO_NODE_SELECTED;
      }
      //TODO: copy and paste branch nodes need connection to the incoming node if they are connected
      //TODO: think about how copying and pasting would work
      //TODO: make cmd c cmd v work
      else if (node.class == "branch") {
        //console.log("branch node created");
        this.gamebookContainerManager._createBranchContainer(node);
      }
    }
    //
    else if (updateType == "nodeRemoved") {
      this.focus();
      this.gamebookContainerManager._deleteGamebookContainersById(
        removedNodeId
      );
      this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "connectionCreated") {
      this._markUsedOutputs();
      //console.log("connection Created'");
      if (inputNode.class == "branch") {
        //
        if (outputNode.class == "branch") {
          //TODO: Dialog should say cant chain branhc nodes
          const dialog = this.shadowRoot.getElementById(
            "branch_input_full_dialog"
          ) as SlDialog;
          dialog.show();
          this.nodeEditor.editor.removeSingleConnection(
            outputNode.id,
            inputNode.id,
            outputClass,
            inputClass
          );
        }

        //console.log(inputNode.inputs["input_1"]?.connections);
        else if (inputNode.inputs["input_1"]?.connections?.length <= 1) {
          this.gamebookContainerManager.addSmartBranchButtonToContainer(
            outputNode,
            inputNode,
            outputClass,
            inputClass
          );
        } else {
          const dialog = this.shadowRoot.getElementById(
            "branch_input_full_dialog"
          ) as SlDialog;
          dialog.show();
          this.nodeEditor.editor.removeSingleConnection(
            outputNode.id,
            inputNode.id,
            outputClass,
            inputClass
          );
        }
      }
      //
      else if (outputNode.class == "branch") {
        if (
          inputNode.id ===
          Number(
            (
              this.gamebookContainerManager._getContainerByDrawflowNodeId(
                outputNode.id
              ) as WebWriterGamebookBranchContainer
            ).incomingContainerDrawflowNodeId
          )
        ) {
          //TODO: Dialog should say no self loop via branch node allowed
          const dialog = this.shadowRoot.getElementById(
            "branch_input_full_dialog"
          ) as SlDialog;
          dialog.show();
          this.nodeEditor.editor.removeSingleConnection(
            outputNode.id,
            inputNode.id,
            outputClass,
            inputClass
          );
        }
      }
      //
      else {
        this.gamebookContainerManager.addConnectionButtonToContainer(
          outputNode,
          inputNode,
          outputClass,
          inputClass
        );
      }
    }

    //
    else if (updateType == "connectionRemoved") {
      this._markUsedOutputs();
      //if a connection is removed by the user, remove the corresponding button
      if (this.reactToCallbackFromNodeEditor) {
        // console.log(
        //   "connection delete",
        //   outputNode.id,
        //   outputClass,
        //   inputNode.id,
        //   inputClass
        // );
        const identifier = `${outputNode.id}-${outputClass}-${inputNode.id}-${inputClass}`;

        if (inputNode.class == "branch") {
          this.gamebookContainerManager.removeSmartBranchButtonFromContainer(
            outputNode.id,
            identifier
          );
        } else {
          this.gamebookContainerManager.removeConnectionButtonFromContainer(
            outputNode.id,
            identifier
          );
        }
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
      //console.log("test");
      //console.log("here before", "deleted output", outputClass);

      this.gamebookContainerManager.updateButtonIdsAfterOutputRemove(
        this.selectedNode.id,
        outputClass
      );

      this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "templateImported") {
      //console.log(importedGamebookContainers);
      this.gamebookContainerManager.importContainers(
        importedGamebookContainers
      );
    }
    //
    else if (updateType == "zoom") {
      this.editorZoom = Number(zoom);
    }
    //
    else if (updateType == "translate") {
      this.editorPosition = translate;
    }
    //
    else if (updateType == "changeOrigin") {
      const originPageContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          changeOrigin.oldId
        );
      if (originPageContainer) {
        (originPageContainer as WebWriterGamebookPageContainer).originPage = 0;
      }

      const newOriginPageContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          changeOrigin.newId
        );
      (newOriginPageContainer as WebWriterGamebookPageContainer).originPage = 1;
    }

    this.editorContent = { ...drawflow };

    this.requestUpdate();
    this._markUsedOutputs();
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
      //console.log("test");
      try {
        this.selectedNode = { ...this.nodeEditor.editor.getNodeFromId(id) };

        if (this.selectedNode) {
          if (
            this.selectedNode.class === "page" ||
            this.selectedNode.class === "origin" ||
            this.selectedNode.class === "popup"
          ) {
            this.gamebookContainerManager._showGamebookContainerById(
              this.selectedNode.id
            );
          }
        }
      } catch (error) {
        this.selectedNode = { ...NO_NODE_SELECTED };
        this.gamebookContainerManager._hideAllGamebookContainers();
      }
    }
    //
    else {
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

  /*
  TODO: make css work with hovering css
  */
  private _handleNodeSearch(event: Event) {
    const inputText = (event.target as SlInput).value;

    if (inputText != "") {
      let nodeIncludes = [
        ...new Set([
          ...this.nodeEditor.searchNodes(inputText),
          ...this.gamebookContainerManager.searchContainers(inputText),
        ]),
      ];

      this.numberOfSearchNodes = nodeIncludes.length;
      this.nodeEditor.highlightSearchedNodes(nodeIncludes);
    } else {
      //console.log("test");
      this.nodeEditor.removeSearchHighlightFromAllNodes();
      this.numberOfSearchNodes = 0;
    }
  }

  /*
  
  */
  private serializeDividerPos(pos: number) {
    this.dividerPos = pos;
  }

  /*
  TODO: This needs to update the nodes view!!!
  */
  private makeNodeOrigin(selectedNodeId: number) {
    this.nodeEditor.makeNodeOrigin(selectedNodeId);

    this.requestUpdate();
  }

  /*

  */
  private handleSwitchPreventClosing(event: Event) {
    const value = (event.target as SlSwitch).checked;

    (
      this.gamebookContainerManager._getContainerByDrawflowNodeId(
        this.selectedNode.id
      ) as WebWriterGamebookPopupContainer
    ).preventClosing = value;

    this.requestUpdate();
  }

  /*


  */
  private handleSwitchNoHeader(event: Event) {
    const value = (event.target as SlSwitch).checked;

    //console.log("no Header", !value);

    (
      this.gamebookContainerManager._getContainerByDrawflowNodeId(
        this.selectedNode.id
      ) as WebWriterGamebookPopupContainer
    ).noHeader = !value;

    this.requestUpdate();
  }

  /*


  */
  private deleteSelectedNode() {
    this.nodeEditor.editor.removeNodeId(`node-${this.selectedNode.id}`);
    (this.shadowRoot.getElementById("delete_node_dialog") as SlDialog).hide();
  }

  // /*

  // */
  // private switchToPreviewMode(containerId: Number = undefined) {
  //   this.startContainerIdPreview = containerId;
  //   this.inPreviewMode = true;
  // }

  // /*

  // */
  // private switchToNodeEditor() {
  //   this.inPreviewMode = false;
  // }

  private checkIfElseRuleTargetIsSet() {
    const branchContainer =
      this.gamebookContainerManager._getContainerByDrawflowNodeId(
        this.selectedNode.id
      ) as WebWriterGamebookBranchContainer;

    if (
      branchContainer.elseRule !== undefined &&
      branchContainer.elseRule.target === ""
    ) {
      //TODO: dialog should say else rule must be set
      const dialog = this.shadowRoot.getElementById(
        "branch_input_full_dialog"
      ) as SlDialog;
      dialog.show();
      return false;
    }

    return true;
  }
  /*


  */

  private _markUsedOutputs() {
    //console.log("we in here");
    // Loop through all nodes in drawflow
    const nodes = this.nodeEditor.editor.drawflow.drawflow.Home.data;

    Object.values(nodes).forEach((node) => {
      if ((node as DrawflowNode).class == "branch") {
        //console.log(this.gamebookContainers);

        //TODO: imporve this
        const branchContainer = this.gamebookContainers.filter((container) => {
          if (container.drawflowNodeId == (node as DrawflowNode).id) {
            return true;
          }
        });

        branchContainer[0].rules.forEach((rule) => {
          const outputElement = this.nodeEditor.shadowRoot
            ?.getElementById(`node-${(node as DrawflowNode).id}`)
            ?.querySelector(`.output.${rule.output_id}`);

          if (!rule.isTargetEnabled) {
            outputElement?.classList.add("output-in-use");
          }
          //
          else {
            if (
              (node as DrawflowNode).outputs[rule.output_id].connections
                .length > 0
            ) {
              // If the output has at least one connection, mark it as in use
              outputElement.classList.add("output-in-use");
            } else {
              // If the output has no connections, remove the in-use class
              outputElement.classList.remove("output-in-use");
            }
          }
        });

        if (branchContainer[0].elseRule) {
          const elseRuleOutputElement = this.nodeEditor.shadowRoot
            ?.getElementById(`node-${(node as DrawflowNode).id}`)
            ?.querySelector(
              `.output.${branchContainer[0].elseRule?.output_id}`
            );

          if (
            (node as DrawflowNode).outputs[
              branchContainer[0].elseRule?.output_id
            ].connections.length > 0
          ) {
            // If the output has at least one connection, mark it as in use
            elseRuleOutputElement.classList.add("output-in-use");
          } else {
            // If the output has no connections, remove the in-use class
            elseRuleOutputElement.classList.remove("output-in-use");
          }
        }
      }
      //
      else {
        Object.entries((node as DrawflowNode).outputs).forEach(
          ([outputClass, output]) => {
            // Get the element corresponding to the output
            const outputElement = this.nodeEditor.shadowRoot
              ?.getElementById(`node-${(node as DrawflowNode).id}`)
              ?.querySelector(`.output.${outputClass}`);

            if (outputElement) {
              if (output.connections.length > 0) {
                // If the output has at least one connection, mark it as in use
                outputElement.classList.add("output-in-use");
              } else {
                // If the output has no connections, remove the in-use class
                outputElement.classList.remove("output-in-use");
              }
            }
          }
        );
      }
    });

    this.requestUpdate();
  }
}
