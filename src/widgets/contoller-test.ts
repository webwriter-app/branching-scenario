import { LitElement, ReactiveController, ReactiveControllerHost } from "lit";

import { WebWriterGamebookPageContainer } from "./gamebook-components/webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./gamebook-components/webwriter-gamebook-popup-container";
import { WebWriterGamebookBranchContainer } from "./gamebook-components/webwriter-gamebook-branch-container";

import { NodeEditor } from "./node-editor/node-editor";
import { GamebookContainerManager } from "./gamebook-container-manager";
import { DrawflowNode } from "drawflow";

export class MouseController implements ReactiveController {
  private host: ReactiveControllerHost;
  nodeEditor: NodeEditor;
  gamebookContainerManager: GamebookContainerManager;
  mutationObserver: MutationObserver;

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
  hostConnected() {
    this.mutationObserver = new MutationObserver(
      this.monitorHostUserContainerDeletion
    );
    const config = {
      attributes: false,
      childList: true,
      subtree: false,
      characterData: false,
    };
    // Start observing the target node for configured mutations
    this.mutationObserver.observe(this.host as LitElement, config);
  }

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

  /*

  */
  _createContainerForNode = (node: DrawflowNode) => {
    (this.host as any).focus();
    const container =
      this.gamebookContainerManager.createContainerFromNode(node);
    (this.host as any).appendChild(container);
  };

  /*

  */
  _copyAndPasteContainer = (pastedNode: DrawflowNode) => {
    (this.host as any).focus();
    const pastedContainer =
      this.gamebookContainerManager.copyAndPasteContainerContents(pastedNode);
    (this.host as any).appendChild(pastedContainer);
  };

  /*

  */
  _removeContainer = (id: number) => {
    (this.host as any).focus();
    this.gamebookContainerManager._deleteGamebookContainersById(id);
  };

  /*

  */
  _removeNode = (id: number) => {
    (this.host as any).focus();
    this.nodeEditor.editor.removeNodeId(`node-${id}`);
  };

  /*

  */
  private monitorHostUserContainerDeletion = (
    mutationList: MutationRecord[]
  ) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach((node) => {
          const nodeName = (node as HTMLElement).nodeName.toLowerCase();
          const isWidget = (node as HTMLElement).classList.contains(
            "ww-widget"
          );
          // "ProseMirror-selectednode" css class confirms that the element is actively selected by the user
          const isSelectedNode = (node as HTMLElement).classList.contains(
            "ProseMirror-selectednode"
          );

          if (isWidget && isSelectedNode) {
            const containerDeletedEvent = (container: {
              drawflowNodeId: string;
            }) => {
              this.gamebookContainerManager._notifyContainerGotDeleted(
                Number(container.drawflowNodeId)
              );
            };

            console.log("test");

            if (nodeName === "webwriter-gamebook-page-container") {
              const container = node as WebWriterGamebookPageContainer;
              containerDeletedEvent(container);
              if (container.originPage === 1) {
                this.nodeEditor.addPageNode("First Page", true);
              }
            } else if (nodeName === "webwriter-gamebook-popup-container") {
              const container = node as WebWriterGamebookPopupContainer;
              containerDeletedEvent(container);
            } else if (nodeName === "webwriter-gamebook-branch-container") {
              const container = node as WebWriterGamebookBranchContainer;
              containerDeletedEvent(container);
            }
          }
        });
      }
    });
  };
}
