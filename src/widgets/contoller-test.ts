import { ReactiveController, ReactiveControllerHost } from "lit";
import { provide, consume, createContext } from "@lit/context";
import { customElement, property, query, queryAll } from "lit/decorators.js";
import { gamebookStore, GamebookStore } from "./context-test";

export class MouseController {
  private host: ReactiveControllerHost;

  //TODO: handle events from editor here and get the right reaction from the main
  //TODO: main reaction in here?
  //TODO: can I access context from here?

  pos = { x: 0, y: 0 };

  _onMouseMove = ({ clientX, clientY }: MouseEvent) => {
    console.log((this.host as any).nodeEditor);
    this.pos = { x: clientX, y: clientY };
    this.host.requestUpdate();
  };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener("mousemove", this._onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener("mousemove", this._onMouseMove);
  }
}
