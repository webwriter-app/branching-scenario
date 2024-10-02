import { html, css, LitElement, PropertyValues } from "lit";
import { provide, consume, createContext } from "@lit/context";

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
  SlDivider,
  SlIconButton,
  SlButtonGroup,
} from "@shoelace-style/shoelace";

import styles from "../css/webwriter-branching-scenario-css";

import search from "@tabler/icons/outline/search.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import book from "@tabler/icons/outline/book.svg";
import packages from "@tabler/icons/outline/packages.svg";
import trash from "@tabler/icons/outline/trash.svg";

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

import { gamebookStore, GamebookStore } from "./context-test";
import { MouseController } from "./contoller-test";

@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  @query("gamebook-container-manager") accessor gamebookContainerManager;

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, webwriter-gamebook-branch-container",
  })
  accessor gamebookContainers;

  @query("node-editor") public accessor nodeEditor;

  @query("sl-split-panel") accessor splitPanel;
  @query("#widget") accessor widgetDiv;
  @query("selected-node-view-renderer") accessor selectedNodeViewRenderer;
  @query("#searchInput") accessor searchInput;

  @property({ type: Number, attribute: true }) accessor numberOfSearchNodes = 0;

  @property({ type: Boolean }) accessor reactToCallbackFromNodeEditor = true;
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

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
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-button-group": SlButtonGroup,
    };
  }

  //import CSS
  static styles = [styles];

  // Create an observer instance linked to the callback function
  private mutationObserver: MutationObserver;

  private controller = new MouseController(this);

  //
  @provide({ context: gamebookStore })
  @property({
    type: Object,
    attribute: true,
    reflect: true,
    converter: {
      fromAttribute: (value: string) => GamebookStore.fromString(value), // Deserialize
      toAttribute: (value: GamebookStore) => value.toString(), // Serialize
    },
  })
  public accessor gamebookStore = new GamebookStore("Untitled Gamebook");

  /* 
  
  
  */
  constructor() {
    super();
    this.mutationObserver = new MutationObserver(this.mutationCallback);
    //Initial setting necessary to notify children of change
    this.reflectStoreChangesinDOM();
  }

  /*
  
  */
  protected firstUpdated(_changedProperties: any): void {
    this.gamebookContainerManager._showGamebookContainerById(
      this.gamebookStore.selectedNode.id
    );
    this.handleChangesInGamebookContainers();

    const config = {
      attributes: false,
      childList: true,
      subtree: false,
      characterData: false,
    };
    // Start observing the target node for configured mutations
    this.mutationObserver.observe(this, config);

    this.controller.initReferences(
      this.nodeEditor,
      this.gamebookContainerManager
    );

    // Register an observer to react to store changes
    this.gamebookStore.addObserver(() => {
      this.gamebookContainerManager._showGamebookContainerById(
        this.gamebookStore.selectedNode.id
      );
      this.reflectStoreChangesinDOM();
      this.requestUpdate(); // Ensure Lit re-renders
    });
  }

  /*
  
  */
  reflectStoreChangesinDOM() {
    this.gamebookStore = new GamebookStore(
      this.gamebookStore.title,
      this.gamebookStore.observer,
      this.gamebookStore.selectedNode,
      this.gamebookStore.editorZoom,
      this.gamebookStore.editorPosition,
      this.gamebookStore.dividerPosition,
      this.gamebookStore.editorIsCollapsed,
      this.gamebookStore.editorContent,
      this.gamebookStore.copiedNode
    );
  }

  /*
  
  */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeydown);
  }
  /*
  
  */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
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
      this.gamebookStore.setCopiedNode(this.gamebookStore.selectedNode);
    }
    //
    else if ((event.metaKey || event.ctrlKey) && event.key === "v") {
      event.preventDefault(); // Prevent the default browser find functionality
      this.nodeEditor.pasteNode();
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
        <p>${this.gamebookStore.selectedNode.id}</p>
           <split-view>
                <node-editor
                  slot="start"
                  @nodeCreated=${(e: CustomEvent) =>
                    this.controller._createContainerForNode(e.detail.node)}
                  @nodePasted=${(e: CustomEvent) =>
                    this.controller._copyAndPasteContainer(e.detail.node)}



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
                  .markUsedOutputs=${() => this._markUsedOutputs()}
                  .checkIfElseRuleTargetIsSet=${() =>
                    this.checkIfElseRuleTargetIsSet()}
                >
                </node-editor>
                <selected-node-view-renderer
                 slot="end"
                 @renameSelectedNode="${(e: CustomEvent) =>
                   this.controller._renameSelectedNode(e.detail.newTitle)}"

                
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
                    .appendToShadowDom=${(container) =>
                      this._addContainerCallback(container)}
                  >
                    <slot></slot>
                  </gamebook-container-manager>
                </selected-node-view-renderer>
              </split-view>
        
              <!-- Options Menu -->
              <div part="options" class="author-only">
                <div class="header">
                  <sl-icon src=${book}></sl-icon>
                  <p>Gamebook</p>
                </div>
              
                  <sl-input
                    id="searchInput"
                    placeholder="Nodes, content, ..."
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
        
 


              <!-- <sl-button-group label="Alignment">
                   <sl-button id="copyNodeBtn" 
                   class="flex-item"
                     ?disabled=${this.gamebookStore.selectedNode.id === -1}
                          >Copy</sl-button
                        >
               <sl-button class="flex-item"
                  @click=${() => this.pasteNode()}
                  ?disabled=${this.gamebookStore.copiedNode.id === -1}>
                  Paste
                </sl-button>

                <sl-button 
                class="square"
      
variant="default"
                          id="deleteNodeBtn"
                          @click=${() =>
                            (
                              this.shadowRoot.getElementById(
                                "delete_node_dialog"
                              ) as SlDialog
                            ).show()}
                
                          ?disabled=${
                            this.gamebookStore.selectedNode.id === -1 ||
                            this.gamebookStore.selectedNode.class == "origin"
                              ? true
                              : false
                          }
                          >
                            <sl-icon src=${trash}></sl-icon>
                          </sl-button
                        >

                

                   
</sl-button-group> -->

                ${
                  this.gamebookStore.selectedNode.id != -1
                    ? html`
                        <div class="header">
                          ${this.gamebookStore.selectedNode.class == "page"
                            ? html`<sl-icon src=${file}></sl-icon>
                                <p>Page</p> `
                            : this.gamebookStore.selectedNode.class == "origin"
                            ? html`<sl-icon src=${file}></sl-icon>
                                <p>Start Page</p> `
                            : this.gamebookStore.selectedNode.class == "popup"
                            ? html`<sl-icon src=${squares}></sl-icon>
                                <p>Popup</p>`
                            : this.gamebookStore.selectedNode.class == "branch"
                            ? html`<sl-icon src=${arrowsSplit2}></sl-icon>
                                <p>Smart Branch</p>`
                            : null}
                        </div>

                        ${this.gamebookStore.selectedNode.class == "page" ||
                        this.gamebookStore.selectedNode.class == "origin"
                          ? html` <sl-button
                              id="makeNodeOriginBtn"
                              @click=${() =>
                                this.makeNodeOrigin(
                                  this.gamebookStore.selectedNode.id
                                )}
                              ?disabled=${this.gamebookStore.selectedNode
                                .class == "origin"
                                ? true
                                : false}
                              >Set as Origin</sl-button
                            >`
                          : null}
                        ${this.gamebookStore.selectedNode.class == "branch"
                          ? html`
                              <p>
                                <sl-icon
                                  src="${infoSquareRounded}"
                                  style="vertical-align: middle;  margin: 1px;"
                                ></sl-icon>
                                Create rules to guide how your gamebook
                                progresses. The first rule that applies will be
                                used.
                              </p>
                              <p>
                                <sl-icon
                                  src="${packages}"
                                  style="vertical-align: middle; margin: 1px;"
                                ></sl-icon>
                                Requires
                                <a
                                  href="https://webwriter.app/widgets/"
                                  target="https://webwriter.app/widgets/"
                                  >WebWriter Quiz Widget</a
                                >.
                              </p>
                            `
                          : null}
                        ${this.gamebookStore.selectedNode.class == "popup"
                          ? html`
                              <!-- Get gamebook container manager here and get the container with the matching id, tie attributes directly to the container and let it be controlled here-->
                              <sl-switch
                                ?checked=${(
                                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                                    this.gamebookStore.selectedNode.id
                                  ) as WebWriterGamebookPopupContainer
                                )?.preventClosing}
                                @sl-input=${(event) =>
                                  this.handleSwitchPreventClosing(event)}
                                >Prevent Closing</sl-switch
                              >
                              <sl-switch
                                ?checked=${(
                                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                                    this.gamebookStore.selectedNode.id
                                  ) as WebWriterGamebookPopupContainer
                                )?.noHeader
                                  ? false
                                  : true}
                                @sl-input=${(event) =>
                                  this.handleSwitchNoHeader(event)}
                                >Header</sl-switch
                              >
                            `
                          : null}
                      `
                    : null
                }
              </div>
            </div>
          `
        : html`<webwriter-gamebook
            gamebookTitle=${this.gamebookStore.title != ""
              ? this.gamebookStore.title
              : "Untitled Gamebook"}
            ><slot></slot
          ></webwriter-gamebook>`}

      <!-- Dialogs -->
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
        You are about to delete the node
        "${this.gamebookStore.selectedNode.data.title}". Do you want to proceed?
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

      <sl-dialog
        label="Can not connect branch nodes"
        class="dialog"
        id="cant_chain_branch_nodes_dialog"
      >
        Two Branch nodes can not be connected.
        <sl-button
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (
              this.shadowRoot.getElementById(
                "cant_chain_branch_nodes_dialog"
              ) as SlDialog
            ).hide()}
          >Understood</sl-button
        >
      </sl-dialog>

      <sl-dialog
        label="No self loops allowed."
        class="dialog"
        id="no_self_loops_via_branch_nodes_dialog"
      >
        You cannot connect back to the main node over the connected smart branch
        node.
        <sl-button
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (
              this.shadowRoot.getElementById(
                "no_self_loops_via_branch_nodes_dialog"
              ) as SlDialog
            ).hide()}
          >Understood</sl-button
        >
      </sl-dialog>
    `;
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
    if (updateType == "nodeRemoved") {
      if (this.reactToCallbackFromNodeEditor) {
        this.focus();
        this.gamebookContainerManager._deleteGamebookContainersById(
          removedNodeId
        );
      } else {
        this.reactToCallbackFromNodeEditor = true;
      }
      //this.updateSelectedNode(this.selectedNode.id.toString());
    }
    //
    else if (updateType == "connectionCreated") {
      this._markUsedOutputs();
      //console.log("connection Created'");
      if (inputNode.class == "branch") {
        if (outputNode.class == "branch") {
          const dialog = this.shadowRoot.getElementById(
            "cant_chain_branch_nodes_dialog"
          ) as SlDialog;
          dialog.show();
          this.nodeEditor.editor.removeSingleConnection(
            outputNode.id,
            inputNode.id,
            outputClass,
            inputClass
          );
        }

        //branch node already has a connection
        else if (inputNode.inputs["input_1"]?.connections?.length > 1) {
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
        //
        else {
          this.gamebookContainerManager.addSmartBranchButtonToContainer(
            outputNode,
            inputNode,
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
          const dialog = this.shadowRoot.getElementById(
            "no_self_loops_via_branch_nodes_dialog"
          ) as SlDialog;
          dialog.show();
          this.nodeEditor.editor.removeSingleConnection(
            outputNode.id,
            inputNode.id,
            outputClass,
            inputClass
          );
        }
        //
        else {
          //console.log("updating rule target", outputClass);
          this.gamebookContainerManager.updateBranchContainerRuleTarget(
            outputNode.id,
            outputClass,
            inputNode.id
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
          //TODO: dialog for confirmation needs to happen here
          //Warn about rules being deleted!
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

        if (outputNode.class == "branch") {
          //console.log("removing rule target", outputClass);
          this.gamebookContainerManager.updateBranchContainerRuleTarget(
            outputNode.id,
            outputClass,
            ""
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
          this.gamebookStore.selectedNode.id,
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
          this.gamebookStore.selectedNode.id,
          identifier
        );
      } else {
        this.reactToCallbackFromNodeEditor = true;
      }
    }
    //
    else if (updateType == "editorCleared") {
      this.gamebookContainerManager._deleteAllGamebookContainers();
      //this.updateSelectedNode("-1");

      //console.log(this.gamebookContainerManager.gamebookContainers);
    }
    //
    else if (updateType == "outputCreated") {
      //this.updateSelectedNode(this.selectedNode.id.toString());
      this._markUsedOutputs();
    }
    //
    else if (updateType == "outputDeleted") {
      //console.log("test");
      //console.log("here before", "deleted output", outputClass);

      this.gamebookContainerManager.updateButtonIdsAfterOutputRemove(
        this.gamebookStore.selectedNode.id,
        outputClass
      );

      //this.updateSelectedNode(this.selectedNode.id.toString());
      this._markUsedOutputs();
    }
    //
    else if (updateType == "templateImported") {
      //console.log(importedGamebookContainers);
      this.gamebookContainerManager.importContainers(
        importedGamebookContainers
      );
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

      //this.updateSelectedNode(this.selectedNode.id.toString());
    }

    //
    this.gamebookStore.setEditorContent(drawflow);
    this._markUsedOutputs();
    this.requestUpdate();
  }

  /*


  */
  private handleChangesInGamebookContainers() {
    this.addEventListener("containerDeleteConnectionButton", (event) => {
      //if a button is removed, remove the corresponding connection
      this.reactToCallbackFromNodeEditor = false;
      const identifier = (event as CustomEvent).detail.identifier;
      const parsed = this.parseConnectionIdentifier(identifier);

      this.nodeEditor.editor.removeSingleConnection(
        parsed.outputNodeId,
        parsed.inputNodeId,
        parsed.outputClass,
        parsed.inputClass
      );
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
    this.addEventListener("containerDeleted", (event) => {
      this.reactToCallbackFromNodeEditor = false;
      this.nodeEditor.editor.removeNodeId(
        `node-${(event as CustomEvent).detail.nodeId}`
      );
    });
    this.addEventListener("quizElementDeleted", (event) => {
      const removeConnectionsFromOutputs =
        this.gamebookContainerManager.removeBranchContainerRuleElements(
          (event as CustomEvent).detail.containerId,
          (event as CustomEvent).detail.id,
          (event as CustomEvent).detail.isQuiz
        );

      for (let outputTargetTuple of removeConnectionsFromOutputs) {
        this.reactToCallbackFromNodeEditor = false;
        this.nodeEditor.editor.removeSingleConnection(
          (event as CustomEvent).detail.containerId,
          outputTargetTuple[1],
          outputTargetTuple[0],
          "input_1"
        );
      }
    });
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
        this.gamebookStore.selectedNode.id
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
        this.gamebookStore.selectedNode.id
      ) as WebWriterGamebookPopupContainer
    ).noHeader = !value;

    this.requestUpdate();
  }

  /*


  */
  private deleteSelectedNode() {
    this.nodeEditor.editor.removeNodeId(
      `node-${this.gamebookStore.selectedNode.id}`
    );
    (this.shadowRoot.getElementById("delete_node_dialog") as SlDialog).hide();
  }

  /*


  */
  private checkIfElseRuleTargetIsSet() {
    const branchContainer =
      this.gamebookContainerManager._getContainerByDrawflowNodeId(
        this.gamebookStore.selectedNode.id
      ) as WebWriterGamebookBranchContainer;
    if (
      branchContainer.elseRule !== undefined &&
      branchContainer.elseRule.target === ""
    ) {
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

        //TODO: Get another way of obtaining branch container
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
            outputElement?.classList.add("target-disabled");
            outputElement?.classList.remove("output-has-error");
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
              outputElement?.classList.remove("target-disabled");
            }
          }
        });

        if (branchContainer[0].elseRule) {
          //console.log(branchContainer[0].elseRule?.output_id);
          const elseRuleOutputElement = this.nodeEditor.shadowRoot
            ?.getElementById(`node-${(node as DrawflowNode).id}`)
            ?.querySelector(
              `.output.${branchContainer[0].elseRule?.output_id}`
            );

          if (
            (node as DrawflowNode).outputs[
              branchContainer[0].elseRule?.output_id
            ]?.connections.length > 0
          ) {
            // If the output has at least one connection, mark it as in use
            elseRuleOutputElement?.classList.add("output-in-use");
            elseRuleOutputElement?.classList.remove("output-has-error");
          } else {
            // console.log("hier drinne");
            // console.log(elseRuleOutputElement);
            // If the output has no connections, remove the in-use class
            elseRuleOutputElement?.classList.remove("output-in-use");
            elseRuleOutputElement?.classList.add("output-has-error");
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

  /*

  */
  private mutationCallback = (mutationList: MutationRecord[]) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach((node) => {
          const nodeName = (node as HTMLElement).nodeName.toLowerCase();
          const isWidget = (node as HTMLElement).classList.contains(
            "ww-widget"
          );
          const isSelectedNode = (node as HTMLElement).classList.contains(
            "ProseMirror-selectednode"
          );

          if (isWidget && isSelectedNode) {
            const containerEvent = (container: { drawflowNodeId: string }) => {
              const event = new CustomEvent("containerDeleted", {
                detail: { nodeId: container.drawflowNodeId },
                bubbles: true,
                composed: true,
              });
              this.dispatchEvent(event);
            };

            if (nodeName === "webwriter-gamebook-page-container") {
              const container = node as WebWriterGamebookPageContainer;
              containerEvent(container);
              if (container.originPage === 1) {
                this.nodeEditor.addPageNode("First Page", true);
              }
            } else if (nodeName === "webwriter-gamebook-popup-container") {
              const container = node as WebWriterGamebookPopupContainer;
              containerEvent(container);
            } else if (nodeName === "webwriter-gamebook-branch-container") {
              const container = node as WebWriterGamebookBranchContainer;
              containerEvent(container);
            }
          }
        });
      }
    });
  };
}
