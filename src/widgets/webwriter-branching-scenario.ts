import { LitElementWw } from "@webwriter/lit";
import type { MsgFn } from "@lit/localize";
import { localizer } from "@webwriter/lit/localize";
import { localizeOptions } from "../model/localization";
import { dataBlockSelector, DataBlockObserver, parseData, writeData } from "../components/data-block";
import { html } from "lit";
import { provide } from "@lit/context";
import { Permissions } from "@webwriter/lit/permissions";

import { customElement, property, query, state } from "lit/decorators.js";

import { NodeDetailsView } from "../components/node-detail-view";
import { WebWriterGamebookViewer } from "../components/webwriter-gamebook-viewer";
import { GamebookContainerManager } from "../components/gamebook-container-manager";
import { NodeEditor } from "../components/node-editor";
import { SplitView } from "../components/split-view";
import { VerticalResizeView } from "../components/vertical-resize-view";

import styles from "./webwriter-branching-scenario.styles";

import {
  editorState,
  GamebookEditorState,
} from "../components/gamebook-editor-state-context";
import type { EditorContent } from "../model/editor-content";
import { GamebookEditorController } from "../components/gamebook-editor-controller";
import { WebWriterGamebookOptions } from "../components/webwriter-gamebook-options";

/**
 * This widget allows for the creation and editing of branching gamebooks. These are adaptable learning experiences, where you present the student with choices on how to continue.
 */
@customElement("webwriter-branching-scenario")
export class WebwriterBranchingScenario extends LitElementWw {
  /** @internal */
  static scopedElements = {
    "webwriter-gamebook-viewer": WebWriterGamebookViewer,
    "gamebook-container-manager": GamebookContainerManager,
    "node-detail-view": NodeDetailsView,
    "node-editor": NodeEditor,
    "webwriter-gamebook-options": WebWriterGamebookOptions,
    "split-view": SplitView,
    "vertical-resize-view": VerticalResizeView,
  };

  /** @internal */
  static styles = [styles];

  static actions = {
    configureScenario: { label: (widget: { msg: MsgFn }) => widget.msg("Scenario options") },
  };

  protected readonly localize = localizer(this, { ...localizeOptions, drawer: true });
  readonly msg = this.localize.msg;
  #permissions = new Permissions(this);
  private controller = new GamebookEditorController(this);

  /**
   * The state of the editor in a stringified JSON format
   */
  @provide({ context: editorState })
  @property({ attribute: false })
  public accessor editorState = new GamebookEditorState("");

  /** @internal */
  @property({ type: Number, attribute: true, reflect: true })
  accessor tabIndex = -1;

  /** @internal */
  @query("gamebook-container-manager") accessor gamebookContainerManager: GamebookContainerManager;
  /** The node editor component */
  @query("node-editor") public accessor nodeEditor: NodeEditor;
  /** @internal */
  @query("webwriter-gamebook-options") accessor gamebookOptions: WebWriterGamebookOptions;
  @state() private accessor optionsMounted = false;

  private lastDataText: string | null = null;
  private savedGraph = "null";
  private savedTitle = "";
  private dataObserver = new DataBlockObserver(this, () => this.restoreScenario());

  private get dataText() {
    return this.querySelector(dataBlockSelector + ":not([data-branching-labels])")?.textContent ?? null;
  }

  private applySnippetLabels() {
    const seed = this.querySelector(':scope > script[type="application/json"][slot="data"][data-branching-labels]');
    if (!seed) return;
    let labels: {
      pages?: Record<string, {pagetitle?: string; titlelabel?: string}>;
      buttons?: Record<string, string>;
    };
    try { labels = JSON.parse(seed.textContent ?? ""); }
    catch { return; }
    if (!labels || typeof labels !== "object") return;

    for (const page of this.querySelectorAll(":scope > webwriter-gamebook-page, :scope > webwriter-gamebook-popup")) {
      const entry = labels.pages?.[page.getAttribute("drawflownodeid") ?? ""];
      for (const attribute of ["pagetitle", "titlelabel"] as const) {
        if (typeof entry?.[attribute] === "string") page.setAttribute(attribute, entry[attribute]);
      }
    }
    for (const button of this.querySelectorAll("webwriter-gamebook-button[identifier]")) {
      if (button.closest("webwriter-branching-scenario") !== this) continue;
      const name = labels.buttons?.[button.getAttribute("identifier") ?? ""];
      if (typeof name === "string") button.setAttribute("name", name);
    }
    seed.remove();
  }

  private restoreScenario() {
    this.applySnippetLabels();
    const text = this.dataText;
    if (this.lastDataText === text) return;
    this.lastDataText = text;
    const saved = parseData<{ title: string; editorContent: EditorContent }>(text);
    const store = new GamebookEditorState(saved.title ?? "", this.onStoreChanged);
    store.editorContent = saved.editorContent ?? null;
    const snapshot = store.authoredState();
    const encodedGraph = JSON.stringify(snapshot.editorContent);
    const graphChanged = encodedGraph !== this.savedGraph;
    store.editorContent = snapshot.editorContent;
    this.savedTitle = snapshot.title;
    this.savedGraph = encodedGraph;
    if (graphChanged) {
      this.editorState = store;
      this.nodeEditor?.restoreAuthoredContent(store.editorContent);
    } else {
      this.editorState = Object.assign(new GamebookEditorState(), this.editorState, { title: store.title });
    }
  }

  private onStoreChanged = (authored: boolean) => {
    if (authored) {
      if (this.lastDataText !== this.dataText) {
        this.restoreScenario();
        return;
      }
      const snapshot = this.editorState.authoredState();
      const encodedGraph = JSON.stringify(snapshot.editorContent);
      if (snapshot.title !== this.savedTitle || encodedGraph !== this.savedGraph) {
        writeData(this, snapshot);
        this.savedTitle = snapshot.title;
        this.savedGraph = encodedGraph;
        this.lastDataText = this.dataText;
      }
    }
    this.editorState = Object.assign(new GamebookEditorState(), this.editorState);
  };

  constructor() {
    super();
    this.editorState.addObserver(this.onStoreChanged);
  }

  protected updated() {
    this.controller.initReferences(this.nodeEditor, this.gamebookContainerManager);
  }

  connectedCallback() {
    super.connectedCallback();
    this.restoreScenario();
    this.dataObserver.connect();
    this.addEventListener("keydown", this._handleKeydown);
  }

  disconnectedCallback() {
    this.dataObserver.disconnect();
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._handleKeydown);
  }

  async configureScenario() {
    if (!this.#permissions.editing) return;
    this.optionsMounted = true;
    await this.updateComplete;
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("#scenario-options");
    if (dialog?.isConnected && !dialog.open) dialog.showModal();
  }

  private _handleKeydown = async (event: KeyboardEvent) => {
    if (!this.#permissions.editing) return;
    // Check if CMD (Mac) or CTRL (Windows/Linux) and F key is pressed
    if ((event.metaKey || event.ctrlKey) && event.key === "f") {
      event.preventDefault();
      await this.configureScenario();
      await this.gamebookOptions?.updateComplete;
      this.gamebookOptions?.searchInput?.focus();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "c") {
      event.preventDefault();
      this.editorState.setCopiedNode(this.editorState.selectedNode);
    } else if ((event.metaKey || event.ctrlKey) && event.key === "v") {
      event.preventDefault();
      this.controller._pasteNode();
    }
  };

  render() {
    return html`
      ${this.#permissions.editing
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
                  @recreateContainer=${() =>
                    this.controller._recreateContainerForSelectedNode()}
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
                    @nodeWwSelected=${(e: CustomEvent) =>
                      this.controller._selectWwSelectedNode(e.detail.nodeId)}
                  >
                    <slot></slot>
                  </gamebook-container-manager>
                </node-detail-view>
              </vertical-resize-view>
            </split-view>

            ${this.optionsMounted ? html`<dialog id="scenario-options" aria-label=${this.localize.msg("Scenario options")} style="width:min(34rem,calc(100% - 2rem));max-height:85%;box-sizing:border-box">
              <form method="dialog"><button>${this.localize.msg("Close")}</button></form>
              <webwriter-gamebook-options
              @makeSelectedNodeOrigin=${(e: CustomEvent) =>
                this.controller._changeOrigin(e)}
              @pasteNode=${() => this.controller._pasteNode()}
              @deleteSelectedNode=${() => this.controller._deleteSelectedNode()}
              @nodeSearch=${() => this.controller.nodeSearch()}
              @moveTo=${(e: CustomEvent) =>
                this.controller.moveTo(e.detail.node)}
              @highlightNode=${(e: CustomEvent) =>
                this.controller._highlightNode(e)}
              @unhighlightNode=${(e: CustomEvent) =>
                this.controller._unhighlightNode(e)}
              ></webwriter-gamebook-options>
            </dialog>` : null}
          `
        : html` <webwriter-gamebook-viewer
            .scenario=${this}
            gamebookTitle=${this.editorState.title != ""
              ? this.editorState.title
              : this.localize.msg("Untitled Gamebook")}
            ><slot></slot
          ></webwriter-gamebook-viewer>`}
    `;
  }

}
