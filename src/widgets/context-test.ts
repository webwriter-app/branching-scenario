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
  //Use observer pattern to notify main view of cahnge
  observer: Observer;

  constructor(
    title = "Gamebook Title",
    observer = null,
    selectedNode = NO_NODE_SELECTED
  ) {
    this.title = title;
    this.selectedNode = selectedNode;
    this.observer = observer;
  }

  setTitle(newTitle = Math.random().toString()) {
    this.title = newTitle;
    this.notifyObservers(); // Notify all observers when updated
  }

  setSelectedNode(node = NO_NODE_SELECTED) {
    this.selectedNode = node;
    this.notifyObservers(); // Notify all observers when updated
  }

  // Method to register an observer
  addObserver(observer: Observer) {
    this.observer = observer;
  }

  // Method to notify all observers
  private notifyObservers() {
    this.observer();
  }

  // Serialize the store object to a string (for attribute reflection)
  toString() {
    return JSON.stringify({ title: this.title, observer: this.observer });
  }

  // Static method to deserialize from string to GamebookStore instance
  static fromString(serialized: string) {
    const data = JSON.parse(serialized);
    return new GamebookStore(data.title, data.observer);
  }
}
