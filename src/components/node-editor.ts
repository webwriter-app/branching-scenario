import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { SceneController } from "@webwriter/lit/scene";
import { Viewport } from "@webwriter/lit/viewport";
import { Scene, sceneElements, webglAvailable, type ConnectDetail, type ContextDetail, type MoveDetail, type SelectDetail } from "@webwriter/widget/scene";
import { PixiScene } from "@webwriter/widget/scene/pixi";
import { transaction } from "@webwriter/widget/transaction";
import { html, nothing } from "lit";
import { consume } from "@lit/context";
import { property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { str } from "@lit/localize";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";

import fileFilled from "@tabler/icons/filled/file.svg";
import fileOutline from "@tabler/icons/outline/file.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";
import dotsVertical from "@tabler/icons/outline/grip-vertical.svg";
import zoomIn from "@tabler/icons/outline/zoom-in.svg";
import zoomOut from "@tabler/icons/outline/zoom-out.svg";
import squaresFilled from "@tabler/icons/filled/squares.svg";
import squaresOutline from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import mapPin from "@tabler/icons/outline/map-pin.svg";
import closeIcon from "@tabler/icons/outline/x.svg";

import { Diagram, linkKey, parseLinkKey, type DiagramEvent, type DiagramNode, type Link, type NodeKind } from "../model/diagram";
import type { EditorContent, NodeTemplate } from "../model/editor-content";
import { editorState, GamebookEditorState } from "./gamebook-editor-state-context";
import { remapContainers } from "./template-containers";
import { NodeEditorToolbar } from "./node-editor-toolbar";
import { NodeEditorHelpMenu } from "./node-editor-help-menu";
import diagramStyles from "./diagram.styles";
import styles from "./node-editor.styles";

/** How the controller says an output of a node is drawn. */
export interface OutputState {
  inUse?: boolean;
  targetDisabled?: boolean;
  hasError?: boolean;
}

const GRID_SPACING = 40;
const START_SCALE = 0.45;
const ZOOM_RANGE = { min: 0.2, max: 0.8 };
const ZOOM_STEP = 1.1;
const NODE_SIZE = { width: 320, height: 109 };
const KIND_ICONS: Record<string, string> = { page: fileFilled, origin: fileFilled, popup: squaresFilled, branch: arrowsSplit2 };
const portKey = (nodeId: number, outputClass: string) => `${nodeId}:${outputClass}`;

type AddedType = "Page" | "Popup" | "Branch" | "";

export class NodeEditor extends LitElementWw {
  protected readonly messages = { msg: widgetMsg(this) };
  readonly msg = this.messages.msg;

  static scopedElements = {
    ...sceneElements,
    // Without WebGL the same template is drawn with SVG.
    "ww-scene": webglAvailable() ? PixiScene : Scene,
    "sl-button": SlButton,
    "sl-dialog": SlDialog,
    "sl-divider": SlDivider,
    "sl-icon": SlIcon,
    "sl-input": SlInput,
    "sl-icon-button": SlIconButton,
    "sl-tooltip": SlTooltip,
    "node-editor-toolbar": NodeEditorToolbar,
    "node-editor-help-menu": NodeEditorHelpMenu,
  };

  static styles = [styles, diagramStyles];

  /** The nodes and connections. The document stores what this holds. */
  readonly diagram = new Diagram();
  readonly #viewport = new Viewport(this, {
    // A plain wheel scrolls the document the widget is in; Ctrl or Cmd with it zooms.
    wheel: "page",
    // The first view is small, with the start of the gamebook in the middle.
    start: () => {
      const origin = this.#nodeAt(this.diagram.originId ?? -1);
      return origin ? { centre: this.#centreOf(origin), scale: START_SCALE } : { x: 0, y: 0, scale: START_SCALE };
    },
  });
  readonly scene = new SceneController(this, { viewport: this.#viewport.core });

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  /** The key of the selected node, or of the selected connection. */
  @state() accessor selectedKey = "";
  @state() accessor outputStates: ReadonlyMap<string, OutputState> = new Map();
  @state() accessor highlightedPorts: ReadonlySet<string> = new Set();
  @state() accessor highlightedPaths: ReadonlySet<string> = new Set();
  @state() accessor highlightedNodeId = -1;
  @state() accessor searched: ReadonlySet<number> = new Set();
  @state() accessor menu: { x: number; y: number; key: string } | null = null;
  @state() accessor typeAdded: AddedType = "";
  @state() accessor pagesAdded = 1;
  @state() accessor popupsAdded = 1;
  @state() accessor branchesAdded = 1;

  @query("#nodeEditor") accessor surface!: HTMLElement;

  #loaded = false;
  #pasting = false;
  #peekFrom: { x: number; y: number } | null = null;
  #shownScale = 0;
  #stop?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.#stop = this.diagram.subscribe((event) => this.#changed(event));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#stop?.();
  }

  protected willUpdate() {
    if (this.#loaded) return;
    this.#loaded = true;
    const content = this.editorStore.editorContent;
    if (content) this.diagram.import(structuredClone(content));
  }

  protected firstUpdated() {
    if (!this.editorStore.editorContent) {
      this.addNode("origin", this.messages.msg("First Page"));
    } else {
      const selected = this.editorStore.selectedNode.id;
      if (selected !== -1) this.programaticallySelectNode(selected);
      this.#emit("editorInitialized");
    }
  }

  protected updated() {
    const { scale } = this.#viewport;
    if (scale === this.#shownScale) return;
    if (this.#shownScale) {
      this.renderRoot
        .querySelector(".zoomValue")
        ?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], 2000);
    }
    this.#shownScale = scale;
  }

  // ── Used by the controller ───────────────────────────────────────────

  /** Replaces the graph with what the document says now. */
  restoreAuthoredContent(content: EditorContent | null) {
    if (content) this.diagram.import(structuredClone(content));
    else this.diagram.clear();
    if (!this.#nodeAt(this.selectedKey) && !parseLinkKey(this.selectedKey)) this.selectedKey = "";
    this.requestUpdate();
  }

  addNode(kind: NodeKind, title: string) {
    const center = this.#viewCenter();
    this.#undoStep(() => this.diagram.addNode(kind, title, center.x - NODE_SIZE.width / 2, center.y - NODE_SIZE.height / 2));
    if (kind === "popup") this.popupsAdded++;
    else if (kind === "branch") this.branchesAdded++;
    else this.pagesAdded++;
    this.#dialog("add_node_dialog")?.hide();
  }

  pasteNode() {
    const copied = this.editorStore.copiedNode;
    if (copied.id === -1) return;
    const kind = copied.class === "origin" ? "page" : (copied.class as NodeKind);
    if (!["page", "popup", "branch"].includes(kind)) return;
    this.#pasting = true;
    this.addNode(kind, `${copied.data.title} copy`);
  }

  searchNodes(value: string) {
    return this.diagram.search(value);
  }

  highlightSearchedNodes(ids: number[]) {
    this.searched = new Set(ids);
  }

  removeSearchHighlightFromAllNodes() {
    this.searched = new Set();
  }

  makeNodeOrigin(id: number) {
    this.diagram.setOrigin(id);
  }

  programaticallySelectNode(id: string | number) {
    this.selectedKey = String(id);
  }

  programaticallyUnselectConnection() {
    if (parseLinkKey(this.selectedKey)) this.selectedKey = "";
  }

  highlightConnection(link: Link) {
    this.#mark("highlightedPaths", [linkKey(link)], true);
    this.#mark("highlightedPorts", [portKey(link.outputId, link.outputClass), portKey(link.inputId, link.inputClass)], true);
  }

  unhighlightConnection(link: Link) {
    this.#mark("highlightedPaths", [linkKey(link)], false);
    this.#mark("highlightedPorts", [portKey(link.outputId, link.outputClass), portKey(link.inputId, link.inputClass)], false);
  }

  highlightOutput(nodeId: number, outputClass: string) {
    this.#mark("highlightedPorts", [portKey(nodeId, outputClass)], true);
  }

  unhighlightOutput(nodeId: number, outputClass: string) {
    this.#mark("highlightedPorts", [portKey(nodeId, outputClass)], false);
  }

  unhighlightAllOutputs() {
    this.highlightedPorts = new Set([...this.highlightedPorts].filter((key) => !key.split(":")[1].startsWith("output")));
  }

  /** Marks a node and shows it: the view moves to it until `unhighlightNode`. */
  highlightNode(id: number) {
    this.highlightedNodeId = id;
    const node = this.#nodeAt(id);
    if (!node) return;
    this.#peekFrom ??= { x: this.#viewport.x, y: this.#viewport.y };
    void this.moveToNode(node, true);
  }

  unhighlightNode() {
    this.highlightedNodeId = -1;
    if (!this.#peekFrom) return;
    void this.#viewport.setView(this.#peekFrom, { animate: true });
    this.#peekFrom = null;
  }

  /** Puts the node in the middle of the view. */
  moveToNode(node: DiagramNode, animate: boolean) {
    return this.#viewport.centerOn(this.#centreOf(node), undefined, { animate });
  }

  // ── The diagram changed ──────────────────────────────────────────────

  #changed(event: DiagramEvent) {
    this.editorStore.setEditorContent(this.diagram.export());
    this.requestUpdate();
    switch (event.type) {
      case "nodeCreated": {
        const node = this.diagram.node(event.id);
        this.#emit(this.#pasting ? "nodePasted" : "nodeCreated", { node });
        this.#pasting = false;
        break;
      }
      case "nodeRemoved":
        this.#emit("nodeRemoved", { id: event.id });
        break;
      case "connectionCreated":
        this.#connected(event.link);
        break;
      case "connectionRemoved":
        this.#disconnected(event.link);
        break;
    }
  }

  #connected({ outputId, inputId, outputClass, inputClass }: Link) {
    const outputNode = this.diagram.node(outputId);
    const inputNode = this.diagram.node(inputId);
    if (!outputNode || !inputNode) return;
    this.editorStore.setSelectedNode(outputNode);
    const name = inputNode.class === "branch" ? "nodeConnectedToBranchNode" : outputNode.class === "branch" ? "branchNodeConnected" : "nodesConnected";
    this.#emit(name, { outputNode, inputNode, outputClass, inputClass });
  }

  #disconnected({ outputId, inputId, outputClass, inputClass }: Link) {
    const outputNode = this.diagram.node(outputId);
    const inputNode = this.diagram.node(inputId);
    if (!outputNode || !inputNode) return;
    this.programaticallyUnselectConnection();
    if (outputNode.class === "branch") this.#emit("branchNodeConnectionRemoved", { outputNode, outputClass });
    else this.#emit("connectionRemoved", { outputNode, outputClass, inputNode, inputClass });
    const current = this.diagram.node(outputId);
    if (current) this.editorStore.setSelectedNode(current);
  }

  // ── What the reader does in the scene ────────────────────────────────

  #onSelect(event: CustomEvent<SelectDetail>) {
    if (event.defaultPrevented) return;
    this.#select(event.detail.keys[0] ?? "");
  }

  /** Selects a node or a connection (or nothing) and tells the controller what changed. */
  #select(key: string) {
    this.menu = null;
    const before = this.selectedKey;
    if (key === before) return;
    const wasLink = parseLinkKey(before);
    this.selectedKey = key;
    if (wasLink) {
      this.#emit("connectionUnselected", {
        outputNode: this.diagram.node(wasLink.outputId),
        inputNode: this.diagram.node(wasLink.inputId),
        outputClass: wasLink.outputClass,
        inputClass: wasLink.inputClass,
      });
    }
    if (before) this.#emit("nodeUnselected");
    const link = parseLinkKey(key);
    if (link) {
      this.#emit("nodeSelected", { nodeId: link.outputId });
      this.#emit("connectionSelected", {
        outputNode: this.diagram.node(link.outputId),
        inputNode: this.diagram.node(link.inputId),
        outputClass: link.outputClass,
        inputClass: link.inputClass,
      });
    } else if (key) {
      this.#emit("nodeSelected", { nodeId: Number(key) });
    }
  }

  #onMove(event: CustomEvent<MoveDetail>) {
    for (const { key, x, y } of event.detail.items) this.diagram.moveNode(Number(key), x, y);
  }

  #onConnect(event: CustomEvent<ConnectDetail>) {
    const [outputId, outputClass] = event.detail.from.split(":");
    const [inputId, inputClass] = event.detail.to.split(":");
    const link = { outputId: Number(outputId), inputId: Number(inputId), outputClass, inputClass };
    if (this.diagram.rejection(link) || this.diagram.addConnection(link)) event.preventDefault();
  }

  #onKeydown(event: KeyboardEvent) {
    const typing = (event.composedPath()[0] as HTMLElement).matches?.("input, textarea, [contenteditable]");
    if (event.key === "Escape") this.menu = null;
    if (typing || !(event.key === "Delete" || (event.key === "Backspace" && event.metaKey))) return;
    this.#deleteSelected();
  }

  /** A right click, the menu key or a long press on a node or a connection: select it and offer to delete it. */
  #onContext(event: CustomEvent<ContextDetail>) {
    const { kind, key, point } = event.detail;
    if (kind !== "node" && kind !== "path") return;
    event.preventDefault();
    this.#select(key);
    if (this.#nodeAt(key)?.class === "origin") return;
    const box = this.surface.getBoundingClientRect();
    this.menu = { x: point.clientX - box.left, y: point.clientY - box.top, key };
  }

  /** Deletes the selected node (not the start of the gamebook) or connection. */
  #deleteSelected() {
    const key = this.menu?.key ?? this.selectedKey;
    this.menu = null;
    const link = parseLinkKey(key);
    const node = this.#nodeAt(key);
    if (link) {
      this.#undoStep(() => this.diagram.removeConnection(link.outputId, link.inputId, link.outputClass, link.inputClass));
    } else if (node && node.class !== "origin") {
      this.deleteNode(node.id);
    }
  }

  deleteNode(id: number) {
    this.#undoStep(() => this.diagram.removeNode(id));
    if (this.selectedKey === String(id)) this.#select("");
  }

  // ── Adding, clearing, templates ──────────────────────────────────────

  #openAddDialog(type: AddedType) {
    this.typeAdded = type;
    this.#dialog("add_node_dialog")?.show();
  }

  #confirmAdd() {
    if (!this.typeAdded) return;
    const title = this.renderRoot.querySelector<SlInput>("#title_input")?.value ?? "";
    this.addNode(this.typeAdded.toLowerCase() as NodeKind, title);
  }

  #addTemplate(template: NodeTemplate) {
    const center = this.#viewCenter();
    let templateContainers: NodeTemplate["containers"] = [];
    this.#undoStep(() => {
      const ids = this.diagram.insert(template, center.x - 317 / 2, center.y - 105 / 2);
      templateContainers = remapContainers(template.containers, ids);
      this.editorStore.setEditorContent(this.diagram.export());
      this.#emit("nodeGroupImported", { templateContainers });
    });
  }

  #clear() {
    this.#dialog("dialog")?.hide();
    this.#undoStep(() => {
      this.diagram.clear();
      this.selectedKey = "";
      this.editorStore.setEditorContent(this.diagram.export());
      this.#emit("editorCleared");
      this.addNode("origin", this.messages.msg("First Page"));
    });
    this.pagesAdded = 1;
    this.popupsAdded = 1;
    this.branchesAdded = 1;
  }

  // ── The view ─────────────────────────────────────────────────────────

  /** The point of the diagram in the middle of the view. */
  #viewCenter() {
    const { x, y, scale, width, height } = this.#viewport;
    return { x: (width / 2 - x) / scale, y: (height / 2 - y) / scale };
  }

  #centreOf(node: DiagramNode) {
    const element = this.renderRoot.querySelector<HTMLElement>(`ww-node[data-ww-key="${node.id}"]`);
    return { x: node.pos_x + (element?.offsetWidth || NODE_SIZE.width) / 2, y: node.pos_y + (element?.offsetHeight || NODE_SIZE.height) / 2 };
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  #nodeAt(key: string | number): DiagramNode | undefined {
    return this.diagram.nodes.find((node) => String(node.id) === String(key));
  }

  #dialog(id: string) {
    return this.renderRoot.querySelector<SlDialog>(`#${id}`);
  }

  #emit(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  /** One undo step: the change and the render that follows it. */
  #undoStep(change: () => void) {
    void transaction(this, async () => {
      change();
      await this.updateComplete;
    });
  }

  #mark(name: "highlightedPorts" | "highlightedPaths", keys: string[], on: boolean) {
    const next = new Set(this[name]);
    for (const key of keys) {
      if (on) next.add(key);
      else next.delete(key);
    }
    this[name] = next;
  }

  // ── Rendering ────────────────────────────────────────────────────────

  render() {
    const view = this.#viewport;
    const percent = Math.round(((view.scale - ZOOM_RANGE.min) / (ZOOM_RANGE.max - ZOOM_RANGE.min)) * 100);
    const nodes = this.diagram.nodes;

    return html`
      <div id="nodeEditor" @keydown=${this.#onKeydown} @pointerdown=${this.#closeMenu}>
        <ww-scene
          select="single"
          data-ww-viewport="canvas"
          data-ww-viewport-fit="none"
          data-ww-viewport-zoom="${ZOOM_RANGE.min} ${ZOOM_RANGE.max}"
          background="dots"
          background-spacing=${GRID_SPACING}
          @ww-select=${this.#onSelect}
          @ww-move=${this.#onMove}
          @ww-connect=${this.#onConnect}
          @ww-context=${this.#onContext}
        >
          ${this.#links().map((link) => this.#renderLink(link))}
          ${repeat(nodes, (node) => node.id, (node) => this.#renderNode(node))}
        </ww-scene>

        <node-editor-toolbar
          @addPageNode=${() => this.#openAddDialog("Page")}
          @addPopUpNode=${() => this.#openAddDialog("Popup")}
          @addBranchNode=${() => this.#openAddDialog("Branch")}
          @addTemplate=${(e: CustomEvent) => this.#addTemplate(e.detail.template)}
          @clearDialog=${() => this.#dialog("dialog")?.show()}
        ></node-editor-toolbar>

        ${this.menu
          ? html`<button class="deleteButton" style="left: ${this.menu.x}px; top: ${this.menu.y}px" @click=${() => this.#deleteSelected()}>
              <sl-icon src=${closeIcon}></sl-icon>
            </button>`
          : nothing}

        <div class="zoomControls">
          <sl-tooltip content=${this.messages.msg("Jump to origin node")}>
            <sl-icon-button
              id="jumpToOriginBtn"
              src=${mapPin}
              style="font-size: 18px;"
              @click=${() => {
                const origin = this.#nodeAt(this.diagram.originId ?? -1);
                if (origin) void this.moveToNode(origin, true);
              }}
            ></sl-icon-button>
          </sl-tooltip>
          <sl-divider vertical style="height: 20px; margin: 2px;"></sl-divider>
          <sl-icon-button id="zoomInBtn" src=${zoomIn} style="font-size: 18px;" @click=${() => view.zoomBy(ZOOM_STEP)}></sl-icon-button>
          <sl-icon-button id="zoomOutBtn" src=${zoomOut} style="font-size: 18px;" @click=${() => view.zoomBy(1 / ZOOM_STEP)}></sl-icon-button>
        </div>

        <div class="zoomValue"><p>${percent}%</p></div>

        <node-editor-help-menu></node-editor-help-menu>
      </div>
      ${this.#renderDialogs()}
    `;
  }

  #closeMenu(event: Event) {
    if (this.menu && !(event.target as Element).closest?.(".deleteButton")) this.menu = null;
  }

  /** Every connection that has both its ends, drawn from the outputs. */
  #links(): Link[] {
    const links: Link[] = [];
    for (const node of this.diagram.nodes) {
      for (const [outputClass, port] of Object.entries(node.outputs)) {
        for (const { node: target, output: inputClass } of port.connections) {
          if (this.#nodeAt(target)?.inputs[inputClass]) links.push({ outputId: node.id, inputId: Number(target), outputClass, inputClass });
        }
      }
    }
    return links;
  }

  #renderLink(link: Link) {
    const key = linkKey(link);
    return html`<ww-path
      data-ww-key=${key}
      from="${link.outputId}:${link.outputClass}"
      to="${link.inputId}:${link.inputClass}"
      route="curve"
      class=${this.highlightedPaths.has(key) ? "highlighted" : ""}
      selectable
      ?selected=${this.selectedKey === key}
    ></ww-path>`;
  }

  #renderNode(node: DiagramNode) {
    const key = String(node.id);
    const selectedLink = parseLinkKey(this.selectedKey);
    const inputHighlighted =
      this.highlightedPorts.has(portKey(node.id, "input_1")) || (selectedLink?.inputId === node.id && selectedLink.inputClass === "input_1");
    const label = node.class === "popup" ? this.messages.msg("Popup") : node.class === "branch" ? this.messages.msg("Branch") : this.messages.msg("Page");

    return html`<ww-node
      class=${node.class}
      data-ww-key=${key}
      x=${node.pos_x}
      y=${node.pos_y}
      selectable
      movable
      ?selected=${this.selectedKey === key}
      ?highlighted=${this.highlightedNodeId === node.id}
      ?searched=${this.searched.has(node.id)}
    >
      <span class="port input" data-ww-port="input_1" data-ww-accept="flow" ?highlighted=${inputHighlighted}></span>
      <div class="container">
        <div class="iconDiv"><sl-icon class="pageIcon" src=${KIND_ICONS[node.class]}></sl-icon></div>
        <div class="content">
          <div class="title">${node.data.title}</div>
          ${node.class === "origin"
            ? html`<div class="badge"><sl-icon src=${circleArrowRight}></sl-icon><p>${this.messages.msg("Start Page")}</p></div>`
            : html`<p class="input-label">${label}</p>`}
        </div>
        <sl-icon class="threeDots" src=${dotsVertical}></sl-icon>
      </div>
      <div class="outputs">${Object.keys(node.outputs).map((name) => this.#renderOutput(node, name))}</div>
    </ww-node>`;
  }

  #renderOutput(node: DiagramNode, outputClass: string) {
    const key = portKey(node.id, outputClass);
    const portState = this.outputStates.get(key);
    // One wire at most; an output that is disabled or lacks its target takes none.
    const closed = portState?.targetDisabled || portState?.hasError;
    const blocked = closed || portState?.inUse;
    const selectedLink = parseLinkKey(this.selectedKey);
    const highlighted = this.highlightedPorts.has(key) || (selectedLink?.outputId === node.id && selectedLink.outputClass === outputClass);
    return html`<span
      class="port output"
      data-ww-port=${outputClass}
      data-ww-link="flow"
      data-ww-capacity=${closed ? 0 : 1}
      ?in-use=${portState?.inUse}
      ?target-disabled=${portState?.targetDisabled}
      ?has-error=${portState?.hasError}
      ?highlighted=${highlighted}
      @pointerdown=${() => !blocked && this.#select(String(node.id))}
    ></span>`;
  }

  #renderDialogs() {
    const type = this.typeAdded;
    const title =
      type === "Page"
        ? this.messages.msg(str`Untitled Page ${this.pagesAdded}`)
        : type === "Popup"
        ? this.messages.msg(str`Untitled Popup ${this.popupsAdded}`)
        : type === "Branch"
        ? this.messages.msg(str`Untitled Branch ${this.branchesAdded}`)
        : "";
    const label = type === "Page" ? this.messages.msg("Page node") : type === "Popup" ? this.messages.msg("Popup node") : type === "Branch" ? this.messages.msg("Branch node") : "";
    const icon = type === "Page" ? fileOutline : type === "Popup" ? squaresOutline : type === "Branch" ? arrowsSplit2 : "";

    return html`
      <sl-dialog label="${this.messages.msg("Clear Graph")}" class="dialog" id="dialog">
        ${this.messages.msg("Do you want to clear the graph? All your progress will be lost.")}
        <sl-button slot="footer" variant="primary" outline @click=${() => this.#dialog("dialog")?.hide()}>${this.messages.msg("Cancel")}</sl-button>
        <sl-button slot="footer" variant="danger" outline @click=${() => this.#clear()}>${this.messages.msg("Clear")}</sl-button>
      </sl-dialog>
      <sl-dialog label=${this.messages.msg("Delete node")} class="dialog" id="delete_node_dialog">
        ${this.messages.msg(str`You are about to delete the node ${this.editorStore.selectedNode.data.title}.  Do you want to proceed?`)}
        <sl-button slot="footer" variant="primary" outline @click=${() => this.#dialog("delete_node_dialog")?.hide()}>${this.messages.msg("Abort")}</sl-button>
        <sl-button
          slot="footer"
          variant="danger"
          outline
          @click=${() => {
            this.deleteNode(this.editorStore.selectedNode.id);
            this.#dialog("delete_node_dialog")?.hide();
          }}
          >Delete</sl-button
        >
      </sl-dialog>
      <sl-dialog
        label=${this.messages.msg("Adding Node")}
        class="dialog"
        id="add_node_dialog"
        style="width: 100%"
        @keydown=${(event: KeyboardEvent) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          this.#confirmAdd();
        }}
      >
        ${this.messages.msg("Give your new")}
        <div style="display: inline-flex; align-items: baseline; padding: 0 4px; color: #262629;">
          <sl-icon src=${icon} style="display: inline-block; vertical-align: baseline; height: 0.8em; width: auto; line-height: 1;"></sl-icon>
          <span style="margin-left: 6px;">${label}</span>
        </div>
        ${this.messages.msg("a title!")}
        <br />
        <br />
        <sl-input autofocus id="title_input" value=${title}></sl-input>
        <sl-button slot="footer" variant="text" outline @click=${() => this.#dialog("add_node_dialog")?.hide()}>${this.messages.msg("Cancel")}</sl-button>
        <sl-button id="addButton" slot="footer" variant="primary" @click=${() => this.#confirmAdd()}>${this.messages.msg("Add")}</sl-button>
      </sl-dialog>
    `;
  }
}
