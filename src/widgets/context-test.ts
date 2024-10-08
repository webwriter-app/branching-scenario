import { provide, consume, createContext } from "@lit/context";
import { DrawflowNode } from "drawflow";

export const gamebookStore = createContext<GamebookStore>("gamebookStore");

type Observer = () => void;

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

export class GamebookStore {
  title: string;
  selectedNode: DrawflowNode;
  copiedNode: DrawflowNode;
  editorZoom: number;
  editorPosition: any;
  dividerPosition: number;
  editorIsCollapsed: boolean;
  editorContent: any;
  selectedContainer?: any;
  branchIncomingContainer?: any;
  searchTerm: string;
  searchResults: any;

  //Use observer pattern to notify main view of cahnge
  observer: Observer;

  constructor(
    title = "Gamebook Title",
    observer = null,
    selectedNode = NO_NODE_SELECTED,
    editorZoom = -1,
    editorPositon = { x: undefined, y: undefined },
    dividerPosition = 350,
    editorIsCollapsed = false,
    editorContent = null,
    copiedNode = NO_NODE_SELECTED,
    selectedContainer = undefined,
    branchIncomingContainer = undefined,
    searchTerm = "",
    searchResults = undefined
  ) {
    this.title = title;
    this.selectedNode = selectedNode;
    this.editorZoom = editorZoom;
    this.editorPosition = editorPositon;
    this.observer = observer;
    this.dividerPosition = dividerPosition;
    this.editorIsCollapsed = editorIsCollapsed;
    this.editorContent = editorContent;
    this.copiedNode = copiedNode;
    this.selectedContainer = selectedContainer;
    this.branchIncomingContainer = branchIncomingContainer;
    this.searchTerm = searchTerm;
    this.searchResults = searchResults;
  }

  setTitle(newTitle = Math.random().toString()) {
    this.title = newTitle;
    this.notifyObservers(); // Notify all observers when updated
  }

  setSelectedNode(node = NO_NODE_SELECTED) {
    this.selectedNode = node;

    this.notifyObservers(); // Notify all observers when updated
  }

  setSelectedContainer(selectedContainer = undefined) {
    this.selectedContainer = selectedContainer;
    this.notifyObservers(); // Notify all observers when updated
  }

  setBranchIncomingContainer(incomingContainer = undefined) {
    this.branchIncomingContainer = incomingContainer;
    this.notifyObservers(); // Notify all observers when updated
  }

  setEditorZoom(zoom = -1) {
    this.editorZoom = zoom;
    this.notifyObservers(); // Notify all observers when updated
  }

  setEditorPosition(x = -1, y = -1) {
    this.editorPosition = { x: x, y: y };
    this.notifyObservers(); // Notify all observers when updated
  }

  setDividerPosition(pos = 350) {
    this.dividerPosition = pos;
    this.notifyObservers();
  }

  setEditorIsCollapsed(isCollapsed = false) {
    this.editorIsCollapsed = isCollapsed;
    this.notifyObservers();
  }

  setEditorContent(editorContent = null) {
    this.editorContent = editorContent;
    this.notifyObservers();
  }

  setCopiedNode(node = NO_NODE_SELECTED) {
    this.copiedNode = node;
    this.notifyObservers();
  }

  setSearchTerm(term = "") {
    this.searchTerm = term;
    this.notifyObservers();
  }

  setSearchResults(results = undefined) {
    this.searchResults = results;
    this.notifyObservers();
  }

  // Method to register an observer
  addObserver(observer: Observer) {
    this.observer = observer;
  }

  // Method to notify all observers
  private notifyObservers() {
    if (this.observer !== null) {
      this.observer();
    }
  }

  toString() {
    const stringify = JSON.stringify(
      {
        title: this.title,
        observer: this.observer,
        selectedNode: this.selectedNode,
        editorZoom: this.editorZoom,
        editorPosition: this.editorPosition,
        dividerPosition: this.dividerPosition,
        editorIsCollapsed: this.editorIsCollapsed,
        editorContent: this.editorContent,
        copiedNode: this.copiedNode,
        selectedContainer: this.selectedContainer, // Include selectedContainer here
        branchIncomingContainer: this.branchIncomingContainer,
        searchTerm: this.searchTerm,
        searchResults: this.searchResults,
      },
      this.replacer.bind(this)
    );

    return stringify;
  }

  replacer(key, value) {
    // Call the domElementReplacer for selectedContainer (HTMLElement)
    if (key === "selectedContainer" || key === "branchIncomingContainer") {
      return this.domElementReplacer(key, value);
    }
    // Handle other cyclic structures or return value as is
    return value;
  }

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

  // Static method to deserialize from string to GamebookStore instance
  static fromString(serialized: string) {
    const data = JSON.parse(serialized);

    return new GamebookStore(
      data.title,
      data.observer,
      data.selectedNode,
      data.editorZoom,
      data.editorPosition,
      data.dividerPosition,
      data.editorIsCollapsed,
      data.editorContent,
      data.copiedNode,
      data.selectedContainer,
      data.branchIncomingContainer,
      data.searchTerm,
      data.searchResults
    );
  }
}
