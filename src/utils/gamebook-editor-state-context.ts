import { provide, consume, createContext } from "@lit/context";
import { DrawflowNode } from "drawflow";

export const editorState = createContext<GamebookEditorState>("editorState");

type Observer = (authored: boolean) => void;

const NO_NODE_SELECTED: any = {
  id: -1,
  inputs: {},
  outputs: {},
  class: "unselect",
  data: {},
};

const NO_COPY: any = {
  id: -1,
  class: "unselect",
  data: {},
};

export class GamebookEditorState {
  title: string;
  selectedNode: any;
  copiedNode: any;
  editorZoom: number;
  editorPosition: any;
  dividerPosition: number;
  editorIsCollapsed: boolean;
  editorContent: any;
  detailViewHeight: number;
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
    detailViewHeight = 400,
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
    this.detailViewHeight = detailViewHeight;
    this.copiedNode = copiedNode;
    this.selectedContainer = selectedContainer;
    this.branchIncomingContainer = branchIncomingContainer;
    this.searchTerm = searchTerm;
    this.searchResults = searchResults;
  }

  /*

  */
  setTitle(newTitle = Math.random().toString()) {
    this.title = newTitle;
    this.notifyObservers(true); // Notify all observers when updated
  }

  /*

  */
  setSelectedNode(node = NO_NODE_SELECTED) {
    delete node.name;
    delete node.pos_x;
    delete node.pos_y;
    delete node.html;
    delete node.typenode;
    this.selectedNode = node;
    this.notifyObservers(); // Notify all observers when updated
  }

  /*

  */
  setSelectedContainer(selectedContainer = undefined) {
    this.selectedContainer = selectedContainer;
    this.notifyObservers(); // Notify all observers when updated
  }

  /*

  */
  setBranchIncomingContainer(incomingContainer = undefined) {
    this.branchIncomingContainer = incomingContainer;
    this.notifyObservers(); // Notify all observers when updated
  }

  /*

  */
  setEditorZoom(zoom = -1) {
    this.editorZoom = zoom;
    this.notifyObservers(); // Notify all observers when updated
  }

  /*

  */
  setEditorPosition(x = -1, y = -1) {
    this.editorPosition = { x: x, y: y };
    this.notifyObservers(); // Notify all observers when updated
  }

  /*

  */
  setDividerPosition(pos = 350) {
    this.dividerPosition = pos;
    this.notifyObservers();
  }

  /*

  */
  setEditorIsCollapsed(isCollapsed = false) {
    this.editorIsCollapsed = isCollapsed;
    this.notifyObservers();
  }

  /*

  */
  setEditorContent(editorContent = null) {
    this.editorContent = editorContent;
    this.notifyObservers(true);
  }

  /*

  */
  setDetailViewHeight(height = 400) {
    this.detailViewHeight = height;
    this.notifyObservers();
  }

  /*

  */
  setCopiedNode(node = NO_COPY) {
    delete node.name;
    //delete node.inputs;
    //delete node.outputs;
    delete node.pos_x;
    delete node.pos_y;
    delete node.html;
    delete node.typenode;
    delete node.html;

    this.copiedNode = node;

    this.notifyObservers();
  }

  /*

  */
  setSearchTerm(term = "") {
    this.searchTerm = term;
    this.notifyObservers();
  }

  /*

  */
  setSearchResults(results = undefined) {
    this.searchResults = results;
    this.notifyObservers();
  }

  /*

  */
  // Method to register an observer
  addObserver(observer: Observer) {
    this.observer = observer;
  }

  /*

  */
  // Method to notify all observers
  private notifyObservers(authored = false) {
    if (this.observer !== null) {
      this.observer(authored);
    }
  }

  authoredState() {
    const { title, editorContent } = this;
    const home = editorContent?.drawflow?.Home;
    if (!home?.data) return { title, editorContent: null };
    const data = Object.fromEntries(Object.entries(home.data).map(([id, node]) => {
      const { html, name, ...authored } = node as DrawflowNode;
      return [id, authored];
    }));
    return {
      title,
      editorContent: { ...editorContent, drawflow: { ...editorContent.drawflow, Home: { ...home, data } } },
    };
  }
}
