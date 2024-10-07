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
import { SplitView } from "./ui-components/split-view";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlDialog } from "@shoelace-style/shoelace";

import styles from "../css/webwriter-branching-scenario-css";

import { gamebookStore, GamebookStore } from "./context-test";
import { MouseController } from "./contoller-test";
import { WebWriterGamebookOptions } from "./webwriter-gamebook-options";

@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  @query("gamebook-container-manager") accessor gamebookContainerManager;
  @query("node-editor") public accessor nodeEditor;
  @query("webwriter-gamebook-options") accessor gamebookOptions;
  @query("sl-split-panel") accessor splitPanel;

  @property({ type: Number, attribute: true }) accessor numberOfSearchNodes = 0;

  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "webwriter-gamebook": WebWriterGamebook,
      "gamebook-container-manager": GamebookContainerManager,
      "selected-node-view-renderer": SelectedNodeViewRenderer,
      "node-editor": NodeEditor,
      "webwriter-gamebook-options": WebWriterGamebookOptions,
      "split-view": SplitView,
      "sl-dialog": SlDialog,
    };
  }

  //import CSS
  static styles = [styles];

  private controller = new MouseController(this);

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
    //Initial setting necessary to notify children of change
    this.reflectStoreChangesinDOM();
  }

  /*
  
  */
  protected firstUpdated(_changedProperties: any): void {
    this.handleChangesInGamebookContainers();

    this.controller.initReferences(
      this.nodeEditor,
      this.gamebookContainerManager
    );

    // Register an observer to react to store changes
    this.gamebookStore.addObserver(() => {
      this.reflectStoreChangesinDOM();
      this.requestUpdate(); // Ensure Lit re-renders
    });

    // this.addEventListener("click", function () {
    //   this.focus(); // Focus the clicked element
    // });

    //this.focus();
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
      this.gamebookStore.copiedNode,
      this.gamebookStore.selectedContainer,
      this.gamebookStore.branchIncomingContainer,
      this.gamebookStore.searchTerm,
      this.gamebookStore.searchResults
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
      this.gamebookOptions.searchInput.focus(); // Focus the sl-input element
    }
    //
    else if ((event.metaKey || event.ctrlKey) && event.key === "c") {
      event.preventDefault(); // Prevent the default browser find functionality
      this.gamebookStore.setCopiedNode(this.gamebookStore.selectedNode);
    }
    //
    else if ((event.metaKey || event.ctrlKey) && event.key === "v") {
      event.preventDefault(); // Prevent the default browser find functionality
      this.controller._pasteNode();
    }
  };

  /*
  
  */
  render() {
    return html`
      <!-- <button @click=${() => this.exportContainersAsString()}></button> -->
      ${this.isContentEditable
        ? html`
            <split-view>
              <node-editor
                slot="start"
                @editorInitialized=${() => this.controller._markUsedOutputs()}
                @nodeSelected=${(e: CustomEvent) =>
                  this.controller._selectContainer(e.detail.nodeId)}
                @nodeUnselected=${(e: CustomEvent) =>
                  this.controller._unselectContainer()}
                @nodeCreated=${(e: CustomEvent) =>
                  this.controller._createContainerForNode(e.detail.node)}
                @nodePasted=${(e: CustomEvent) =>
                  this.controller._copyAndPasteContainer(e.detail.node)}
                @nodeRemoved=${(e: CustomEvent) =>
                  this.controller._removeContainer(e.detail.id)}
                @nodeConnectedToBranchNode=${(e: CustomEvent) =>
                  this.controller._addSmartBranchButton(e)}
                @nodesConnected=${(e: CustomEvent) =>
                  this.controller._addConnectionButton(e)}
                @branchNodeConnected=${(e: CustomEvent) =>
                  this.controller._branchNodeConnected(e)}
                @branchNodeConnectionRemoved=${(e: CustomEvent) =>
                  this.controller._outputBranchNodeConnectionRemove(e)}
                @connectionRemoved=${(e: CustomEvent) =>
                  this.controller._removeButton(e)}
                @editorCleared=${(e: CustomEvent) =>
                  this.controller._editorCleared()}
                @connectionSelected=${(e: CustomEvent) =>
                  this.controller._selectConnectionButton(e)}
                @connectionUnselected=${(e: CustomEvent) =>
                  this.controller._unselectConnectionButton(e)}
                @nodeGroupImported=${(e: CustomEvent) =>
                  this.controller._importTemplateContainers(e)}
              >
              </node-editor>
              <selected-node-view-renderer
                slot="end"
                @renameSelectedNode="${(e: CustomEvent) =>
                  this.controller._renameSelectedNode(e.detail.newTitle)}"
                @addOutput=${(e: CustomEvent) => this.controller._addOutput(e)}
                @deleteOutput=${(e: CustomEvent) =>
                  this.controller._deleteOutput(e)}
                @createConnection=${(e: CustomEvent) =>
                  this.controller._createConnection(e)}
                @deleteConnection=${(e: CustomEvent) =>
                  this.controller._deleteConnection(e)}
                @highlightConnection=${(e: CustomEvent) =>
                  this.controller._highlightConnection(e)}
                @unhighlightConnection=${(e: CustomEvent) =>
                  this.controller._unhighlightConnection(e)}
                @highlightOutput=${(e: CustomEvent) =>
                  this.controller._highlightOutput(e)}
                @unhighlightOutput=${(e: CustomEvent) =>
                  this.controller._unhighlightOutput(e)}
                @highlightNode=${(e: CustomEvent) =>
                  this.controller._highlightNode(e)}
                @unhighlightNode=${(e: CustomEvent) =>
                  this.controller._unhighlightNode(e)}
                @markOutputs=${() => this.controller._markUsedOutputs()}
              >
                <gamebook-container-manager
                  @managerInitialized=${() =>
                    this.controller._markUsedOutputs()}
                  @containerDeleted=${(e: CustomEvent) =>
                    this.controller._removeNode(e.detail.id)}
                  @containerSelectFirstUpdate=${(e: CustomEvent) =>
                    this.controller._selectContainer(e.detail.id)}
                  @containerError=${(e: CustomEvent) =>
                    this.controller._unselectContainer()}
                  @buttonDeleted=${(e: CustomEvent) =>
                    this.controller._removeConnection(e)}
                  @connectionButtonHighlighted=${() => console.log("test")}
                  @connectionButtonUnhighlighted=${() => console.log("test")}
                  @quizElementDeleted=${(e: CustomEvent) =>
                    this.controller._deleteBranchRuleElementAndConnection(e)}
                  @addOutput=${(e: CustomEvent) =>
                    this.controller._addOutput(e)}
                  @deleteOutput=${(e: CustomEvent) =>
                    this.controller._deleteOutput(e)}
                  @createConnection=${(e: CustomEvent) =>
                    this.controller._createConnection(e)}
                  @deleteConnection=${(e: CustomEvent) =>
                    this.controller._deleteConnection(e)}
                  @markOutputs=${() => this.controller._markUsedOutputs()}
                  @makeSelectedNodeOrigin=${(e: CustomEvent) =>
                    this.controller._changeOrigin(e)}
                  @pasteNode=${() => this.controller._pasteNode()}
                  @deleteSelectedNode=${() =>
                    this.controller._deleteSelectedNode()}
                  @nodeSearch=${() => this.controller.nodeSearch()}
                >
                  <slot></slot>
                </gamebook-container-manager>
              </selected-node-view-renderer>
            </split-view>

            <!-- Options Menu -->
            <webwriter-gamebook-options
              part="options"
              @makeSelectedNodeOrigin=${(e: CustomEvent) =>
                this.controller._changeOrigin(e)}
              @pasteNode=${() => this.controller._pasteNode()}
              @deleteSelectedNode=${() => this.controller._deleteSelectedNode()}
              @nodeSearch=${() => this.controller.nodeSearch()}
            ></webwriter-gamebook-options>
          `
        : html`<webwriter-gamebook
            gamebookTitle=${this.gamebookStore.title != ""
              ? this.gamebookStore.title
              : "Untitled Gamebook"}
            ><slot></slot
          ></webwriter-gamebook>`}
    `;
  }

  /*


  */
  private exportContainersAsString() {
    console.log(JSON.stringify(this.nodeEditor.editor.drawflow));
    console.log(
      JSON.stringify(
        this.gamebookContainerManager.gamebookContainers,
        this.domElementReplacer
      )
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
  private handleChangesInGamebookContainers() {
    // this.addEventListener("containerHighlightConnectionButton", (event) => {
    //   this.reactToCallbackFromNodeEditor = false;
    //   this.nodeEditor.highlightConnectionAndNode(
    //     (event as CustomEvent).detail.outputNodeId,
    //     (event as CustomEvent).detail.inputNodeId,
    //     (event as CustomEvent).detail.outputClass,
    //     (event as CustomEvent).detail.inputClass,
    //     (event as CustomEvent).detail.highlightNode
    //   );
    // });
    // this.addEventListener("containerUnhighlightConnectionButton", (event) => {
    //   this.reactToCallbackFromNodeEditor = false;
    //   this.nodeEditor.unhighlightConnectionAndNode(
    //     (event as CustomEvent).detail.outputNodeId,
    //     (event as CustomEvent).detail.inputNodeId,
    //     (event as CustomEvent).detail.outputClass,
    //     (event as CustomEvent).detail.inputClass,
    //     (event as CustomEvent).detail.highlightNode
    //   );
    // });
  }
}
