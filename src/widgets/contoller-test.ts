import { LitElement, ReactiveController, ReactiveControllerHost } from "lit";
import { provide, consume, createContext } from "@lit/context";
import { customElement, property, query, queryAll } from "lit/decorators.js";
import { gamebookStore, GamebookStore } from "./context-test";
import { ContextConsumer } from "@lit/context";

import { NodeEditor } from "./node-editor/node-editor";
import { GamebookContainerManager } from "./gamebook-container-manager";

export class MouseController {
  private host: ReactiveControllerHost;
  nodeEditor: NodeEditor;
  gamebookContainerManager: GamebookContainerManager;

  /*

  */
  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  // Initialize child references
  initReferences(
    nodeEditor: NodeEditor,
    gamebookContainerManager: GamebookContainerManager
  ) {
    this.nodeEditor = nodeEditor;
    this.gamebookContainerManager = gamebookContainerManager;
  }

  /*

  */
  hostConnected() {}

  /*

  */
  hostDisconnected() {}

  /*

  */
  _renameSelectedNode = (title: string) => {
    const selectedNode = (this.host as any).gamebookStore.selectedNode;

    // Use the gamebookStore property instead of casting every time
    this.nodeEditor.editor.updateNodeDataFromId(selectedNode.id, {
      ...selectedNode.data,
      title: title,
    });

    this.gamebookContainerManager._renameContainer(selectedNode.id, title);

    (this.host as any).gamebookStore.setEditorContent(
      this.nodeEditor.editor.drawflow
    );

    (this.host as any).gamebookStore.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNode.id)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };
}
