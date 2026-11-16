import { createContext } from "@lit/context";
import type { DiagramNode } from "../model/diagram";
import type { EditorContent } from "../model/editor-content";
import type { GamebookContainerElement } from "./gamebook-container";

export const editorState = createContext<GamebookEditorState>("editorState");

type Observer = (authored: boolean) => void;

const NO_NODE_SELECTED = {
  id: -1,
  inputs: {},
  outputs: {},
  class: "unselect",
  data: {},
} as unknown as DiagramNode;

const NO_COPY = {
  id: -1,
  class: "unselect",
  data: {},
} as unknown as DiagramNode;

/** Drops what the node editor keeps only for drawing the node. */
function stripLayout(node: DiagramNode) {
  const layout: Partial<DiagramNode> = node;
  delete layout.pos_x;
  delete layout.pos_y;
  delete layout.typenode;
}

export class GamebookEditorState {
  title: string;
  selectedNode: DiagramNode;
  copiedNode: DiagramNode;
  editorZoom: number;
  editorPosition: { x?: number; y?: number };
  dividerPosition: number;
  editorIsCollapsed: boolean;
  editorContent: EditorContent | null;
  detailViewHeight: number;
  selectedContainer?: GamebookContainerElement;
  branchIncomingContainer?: HTMLElement;
  searchTerm: string;
  searchResults?: number[];

  /** Notifies the main view of changes. */
  observer: Observer | null;

  constructor(
    title = "Gamebook Title",
    observer: Observer | null = null,
    selectedNode = NO_NODE_SELECTED,
    editorZoom = -1,
    editorPositon: { x?: number; y?: number } = { x: undefined, y: undefined },
    dividerPosition = 350,
    editorIsCollapsed = false,
    editorContent: EditorContent | null = null,
    detailViewHeight = 400,
    copiedNode = NO_NODE_SELECTED,
    selectedContainer: GamebookContainerElement | undefined = undefined,
    branchIncomingContainer: HTMLElement | undefined = undefined,
    searchTerm = "",
    searchResults: number[] | undefined = undefined
  ) {
    this.title = title;
    this.selectedNode = selectedNode;
    this.editorZoom = editorZoom;
    this.editorPosition = editorPositon;
    this.observer = observer;
    this.dividerPosition = dividerPosition;
    this.editorIsCollapsed = editorIsCollapsed;
    this.editorContent = editorContent;
    this.detailViewHeight = detailViewHeight;
    this.copiedNode = copiedNode;
    this.selectedContainer = selectedContainer;
    this.branchIncomingContainer = branchIncomingContainer;
    this.searchTerm = searchTerm;
    this.searchResults = searchResults;
  }

  setTitle(newTitle = Math.random().toString()) {
    this.title = newTitle;
    this.notifyObservers(true);
  }

  setSelectedNode(node = NO_NODE_SELECTED) {
    stripLayout(node);
    this.selectedNode = node;
    this.notifyObservers();
  }

  setSelectedContainer(selectedContainer: GamebookContainerElement | undefined = undefined) {
    this.selectedContainer = selectedContainer;
    this.notifyObservers();
  }

  setBranchIncomingContainer(incomingContainer: HTMLElement | undefined = undefined) {
    this.branchIncomingContainer = incomingContainer;
    this.notifyObservers();
  }

  setEditorZoom(zoom = -1) {
    this.editorZoom = zoom;
    this.notifyObservers();
  }

  setEditorPosition(x = -1, y = -1) {
    this.editorPosition = { x: x, y: y };
    this.notifyObservers();
  }

  setDividerPosition(pos = 350) {
    this.dividerPosition = pos;
    this.notifyObservers();
  }

  setEditorIsCollapsed(isCollapsed = false) {
    this.editorIsCollapsed = isCollapsed;
    this.notifyObservers();
  }

  setEditorContent(editorContent: EditorContent | null = null) {
    this.editorContent = editorContent;
    this.notifyObservers(true);
  }

  setDetailViewHeight(height = 400) {
    this.detailViewHeight = height;
    this.notifyObservers();
  }

  setCopiedNode(node = NO_COPY) {
    stripLayout(node);

    this.copiedNode = node;

    this.notifyObservers();
  }

  setSearchTerm(term = "") {
    this.searchTerm = term;
    this.notifyObservers();
  }

  setSearchResults(results: number[] | undefined = undefined) {
    this.searchResults = results;
    this.notifyObservers();
  }

  addObserver(observer: Observer) {
    this.observer = observer;
  }

  private notifyObservers(authored = false) {
    if (this.observer !== null) {
      this.observer(authored);
    }
  }

  authoredState() {
    const { title, editorContent } = this;
    const home = editorContent?.drawflow?.Home;
    if (!editorContent || !home?.data) return { title, editorContent: null };
    const data = Object.fromEntries(Object.entries(home.data).map(([id, node]) => {
      const { html, name, ...authored } = node;
      return [id, authored];
    }));
    return {
      title,
      editorContent: { ...editorContent, drawflow: { ...editorContent.drawflow, Home: { ...home, data } } },
    };
  }
}
