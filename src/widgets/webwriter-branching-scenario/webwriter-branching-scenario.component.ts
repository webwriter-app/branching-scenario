import { html, css, LitElement, PropertyValues } from "lit";
import { provide, consume, createContext } from "@lit/context";

import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query } from "lit/decorators.js";

import { NodeDetailsView } from "../../components/node-detail-view/node-detail-view";
import { WebWriterGamebookViewer } from "../../components/gamebook-viewer/webwriter-gamebook-viewer";
import { GamebookContainerManager } from "../../utils/gamebook-container-manager";
import { NodeEditor } from "../../components/node-editor/node-editor";
import { SplitView } from "../../components/split-view/split-view";
import { VerticalResizeView } from "../../components/vertical-resize-view/vertical-resize-view";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlDialog } from "@shoelace-style/shoelace";

import styles from "./webwriter-branching-scenario.styles";

import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";
import { GamebookEditorController } from "../../utils/gamebook-editor-controller";
import { WebWriterGamebookOptions } from "../../components/options-panel/webwriter-gamebook-options";

export class WebWriterBranchingScenario extends LitElementWw {
  @query("gamebook-container-manager") accessor gamebookContainerManager;
  @query("node-editor") public accessor nodeEditor;
  @query("webwriter-gamebook-options") accessor gamebookOptions;
  @query("sl-split-panel") accessor splitPanel;

  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "webwriter-gamebook-viewer": WebWriterGamebookViewer,
      "gamebook-container-manager": GamebookContainerManager,
      "node-detail-view": NodeDetailsView,
      "node-editor": NodeEditor,
      "webwriter-gamebook-options": WebWriterGamebookOptions,
      "split-view": SplitView,
      "vertical-resize-view": VerticalResizeView,
      "sl-dialog": SlDialog,
    };
  }

  //import CSS
  static styles = [styles];

  private controller = new GamebookEditorController(this);

  @provide({ context: editorState })
  @property({
    type: Object,
    attribute: true,
    reflect: true,
    converter: {
      fromAttribute: (value: string) => GamebookEditorState.fromString(value), // Deserialize
      toAttribute: (value: GamebookEditorState) => value.toString(), // Serialize
    },
  })
  public accessor editorState = new GamebookEditorState("Untitled Gamebook");

  // public static get shadowRootOptions(): ShadowRootInit {
  //   return {
  //     ...LitElement.shadowRootOptions,
  //     delegatesFocus: true,
  //   };
  // }

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
    this.controller.initReferences(
      this.nodeEditor,
      this.gamebookContainerManager
    );

    // Register an observer to react to store changes
    this.editorState.addObserver(() => {
      this.reflectStoreChangesinDOM();
      this.requestUpdate(); // Ensure Lit re-renders
    });

    // this.addEventListener("click", function () {
    //   this.focus();
    // });
  }

  /*
  
  */
  reflectStoreChangesinDOM() {
    this.editorState = new GamebookEditorState(
      this.editorState.title,
      this.editorState.observer,
      this.editorState.selectedNode,
      this.editorState.editorZoom,
      this.editorState.editorPosition,
      this.editorState.dividerPosition,
      this.editorState.editorIsCollapsed,
      this.editorState.editorContent,
      this.editorState.copiedNode,
      this.editorState.selectedContainer,
      this.editorState.branchIncomingContainer,
      this.editorState.searchTerm,
      this.editorState.searchResults
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
      this.editorState.setCopiedNode(this.editorState.selectedNode);
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
              <vertical-resize-view slot="end">
                <node-detail-view
                  @renameSelectedNode="${(e: CustomEvent) =>
                    this.controller._renameSelectedNode(e.detail.newTitle)}"
                  @addOutput=${(e: CustomEvent) =>
                    this.controller._addOutput(e)}
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
                    @moveTo=${(e: CustomEvent) =>
                      this.controller.moveTo(e.detail.node)}
                    @hoverButton=${(e: CustomEvent) =>
                      this.controller._highlightConnection(e)}
                    @leaveButton=${(e: CustomEvent) =>
                      this.controller._unhighlightConnection(e)}
                  >
                    <slot></slot>
                  </gamebook-container-manager>
                </node-detail-view>
              </vertical-resize-view>
            </split-view>

            <!-- Options Menu -->
            <webwriter-gamebook-options
              part="options"
              @makeSelectedNodeOrigin=${(e: CustomEvent) =>
                this.controller._changeOrigin(e)}
              @pasteNode=${() => this.controller._pasteNode()}
              @deleteSelectedNode=${() => this.controller._deleteSelectedNode()}
              @nodeSearch=${() => this.controller.nodeSearch()}
              @moveTo=${(e: CustomEvent) =>
                this.controller.moveTo(e.detail.node)}
            ></webwriter-gamebook-options>
          `
        : html` <webwriter-gamebook-viewer
            gamebookTitle=${this.editorState.title != ""
              ? this.editorState.title
              : "Untitled Gamebook"}
            ><slot></slot
          ></webwriter-gamebook-viewer>`}
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
}
