import { LitElement, ReactiveController, ReactiveControllerHost } from "lit";

import { WebWriterGamebookPage } from "../components/gamebook/gamebook-components/gamebook-containers/gamebook-page/webwriter-gamebook-page";
import { WebWriterGamebookPopup } from "../components/gamebook/gamebook-components/gamebook-containers/gamebook-popup/webwriter-gamebook-popup";
import { WebWriterGamebookBranch } from "../components/gamebook/gamebook-components/gamebook-containers/gamebook-branch/webwriter-gamebook-branch";

import { NodeEditor } from "../components/node-editor/node-editor";
import { GamebookContainerManager } from "./gamebook-container-manager";
import { DrawflowNode } from "drawflow";

export class GamebookEditorController implements ReactiveController {
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
      attributes: true,
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
  _selectContainer = (id: number) => {
    const node = this.nodeEditor.editor.getNodeFromId(id);

    const container =
      this.gamebookContainerManager._getContainerByDrawflowNodeId(Number(id));

    if (container) {
      this.gamebookContainerManager._showGamebookContainerById(
        container.drawflowNodeId
      );

      //container.focus();

      (this.host as any).editorState.setSelectedContainer(container);

      if (
        node.class === "branch" &&
        container instanceof WebWriterGamebookBranch
      ) {
        if (container.incomingContainerId !== -1) {
          const incomingContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              container.incomingContainerId
            );

          if (incomingContainer) {
            (this.host as any).editorState.setBranchIncomingContainer(
              incomingContainer
            );
            (this.host as any).editorState.setSelectedNode(node);
          }
        } else {
          (this.host as any).editorState.setSelectedNode(node);
        }
      } else {
        (this.host as any).editorState.setSelectedNode(node);
      }
    } else {
      this._unselectContainer();
    }

    this.nodeEditor.unhighlightAllOutputs();

    (this.host as any).focus(); // Update the host component after changes
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _unselectContainer = () => {
    (this.host as any).editorState.setSelectedNode();
    this.gamebookContainerManager._hideAllGamebookContainers();

    (this.host as any).editorState.setSelectedContainer();
    (this.host as any).editorState.setBranchIncomingContainer();

    this.nodeEditor.unhighlightAllOutputs();

    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _renameSelectedNode = (title: string) => {
    const selectedNode = (this.host as any).editorState.selectedNode;

    // Use the editorState property instead of casting every time
    this.nodeEditor.editor.updateNodeDataFromId(selectedNode.id, {
      ...selectedNode.data,
      title: title,
    });

    this.gamebookContainerManager._renameContainer(selectedNode.id, title);

    (this.host as any).editorState.setEditorContent(
      this.nodeEditor.editor.drawflow
    );

    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNode.id)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _createConnection = (event) => {
    (event as CustomEvent).stopPropagation();

    const selectedNodeId = (this.host as any).editorState.selectedNode.id;

    this.nodeEditor.editor.addConnection(
      event.detail.outputNodeId,
      event.detail.inputNodeId,
      event.detail.outputClass,
      event.detail.inputClass
    );

    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNodeId)
    );

    this._markUsedOutputs();

    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _deleteConnection = (event) => {
    (event as CustomEvent).stopPropagation();

    this.nodeEditor.programaticallyUnselectConnection();

    const selectedNodeId = (this.host as any).editorState.selectedNode.id;

    this.nodeEditor.editor.removeSingleConnection(
      event.detail.outputNodeId,
      event.detail.inputNodeId,
      event.detail.outputClass,
      "input_1"
    );

    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNodeId)
    );

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _createContainerForNode = (node: DrawflowNode) => {
    (this.host as any).focus();
    const container =
      this.gamebookContainerManager.createContainerFromNode(node);
    (this.host as any).appendChild(container);
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
    (this.host as any).focus(); // Update the host component after changes
  };

  /* 
  
  
  */
  _deleteSelectedNode = () => {
    (
      this.nodeEditor.shadowRoot.getElementById("delete_node_dialog") as any
    ).show();
  };

  /*

  */
  _copyAndPasteContainer = (pastedNode: DrawflowNode) => {
    (this.host as any).focus();

    const pastedContainer =
      this.gamebookContainerManager.copyAndPasteContainerContents(pastedNode);

    (this.host as any).appendChild(pastedContainer);
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _pasteNode = () => {
    this.nodeEditor.pasteNode();
    this.host.requestUpdate(); // Update the host component after changes
  };
  /*

  */
  _removeContainer = (id: number) => {
    (this.host as any).focus();
    this._markUsedOutputs();
    this.gamebookContainerManager._deleteGamebookContainersById(id);
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _removeNode = (id: number) => {
    (this.host as any).focus();
    this.nodeEditor.editor.removeNodeId(`node-${id}`);
    this._unselectContainer();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _addSmartBranchButton = (event) => {
    this.gamebookContainerManager.addSmartBranchButtonToContainer(
      event.detail.outputNode,
      event.detail.inputNode,
      event.detail.outputClass,
      event.detail.inputClass
    );
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _addConnectionButton = (event) => {
    this.gamebookContainerManager.addConnectionButtonToContainer(
      event.detail.outputNode,
      event.detail.inputNode,
      event.detail.outputClass,
      event.detail.inputClass
    );
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _branchNodeConnected = (event) => {
    this.gamebookContainerManager.updateBranchContainerRuleTarget(
      event.detail.outputNode.id,
      event.detail.outputClass,
      event.detail.inputNode.id
    );
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _outputBranchNodeConnectionRemove = (event) => {
    const selectedNodeId = (this.host as any).editorState.selectedNode.id;

    this.gamebookContainerManager.updateBranchContainerRuleTarget(
      event.detail.outputNode.id,
      event.detail.outputClass,
      ""
    );
    this._markUsedOutputs();

    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNodeId)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _deleteBranchRuleElementAndConnection = (event) => {
    const removeConnectionsFromOutputs =
      this.gamebookContainerManager.removeBranchContainerRuleElements(
        (event as CustomEvent).detail.containerId,
        (event as CustomEvent).detail.id,
        (event as CustomEvent).detail.isQuiz
      );
    for (let outputTargetTuple of removeConnectionsFromOutputs) {
      this.nodeEditor.editor.removeSingleConnection(
        (event as CustomEvent).detail.containerId,
        outputTargetTuple[1],
        outputTargetTuple[0],
        "input_1"
      );
    }

    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _removeButton = (event) => {
    this.gamebookContainerManager.removeButtonFromContainer(
      event.detail.outputNode.id,
      event.detail.inputNode.id,
      event.detail.outputClass,
      event.detail.inputClass
    );

    if (
      (this.host as any).editorState.selectedNode.id ===
      event.detail.inputNode.id
    ) {
      this._selectContainer(event.detail.inputNode.id);
    } else if (
      (this.host as any).editorState.selectedNode.id ===
      event.detail.outputNode.id
    ) {
      this._selectContainer(event.detail.outputNode.id);
    }

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _removeConnection = (event) => {
    const selectedNodeId = (this.host as any).editorState.selectedNode.id;

    const identifier = (event as CustomEvent).detail.identifier;
    const parsed = this.parseConnectionIdentifier(identifier);

    this.nodeEditor.programaticallyUnselectConnection();

    this.nodeEditor.editor.removeSingleConnection(
      parsed.outputNodeId,
      parsed.inputNodeId,
      parsed.outputClass,
      parsed.inputClass
    );

    const inputNode = this.nodeEditor.editor.getNodeFromId(parsed.inputNodeId);
    if (inputNode.class === "branch") {
      const branchContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          parsed.inputNodeId
        );

      const incomingContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          branchContainer.incomingContainerId
        );

      incomingContainer.branchesOff = -1;

      branchContainer.incomingContainerId = -1;

      branchContainer.clearRules();
    }

    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNodeId)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _editorCleared = () => {
    this.gamebookContainerManager._deleteAllGamebookContainers();
    this._unselectContainer();
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _selectConnectionButton = (event) => {
    const identifier = `${event.detail.outputNode.id}-${event.detail.outputClass}-${event.detail.inputNode.id}-${event.detail.inputClass}`;

    this.gamebookContainerManager.selectButtonInContainer(
      (this.host as any).editorState.selectedNode.id,
      identifier
    );
    this.host.requestUpdate(); // Update the host component after changes
  };

  /*

  */
  _unselectConnectionButton = (event) => {
    // const identifier = `${event.detail.outputNode.id}-${event.detail.outputClass}-${event.detail.inputNode.id}-${event.detail.inputClass}`;

    // this.gamebookContainerManager.unhighlightButtonInContainer(
    //   (this.host as any).editorState.selectedNode.id,
    //   identifier
    // );
    this.host.requestUpdate(); // Update the host component after changes
  };

  /* 
  
  */
  _importTemplateContainers = (event) => {
    const containers = this.gamebookContainerManager.importContainers(
      event.detail.templateContainers
    );

    containers.forEach((container) => {
      (this.host as any).appendChild(container);
    });

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /* 
  
  */
  _changeOrigin = (event) => {
    this.nodeEditor.makeNodeOrigin(event.detail.newId);

    this.gamebookContainerManager.changeOrigin(event.detail.newId);

    (this.host as any).editorState.setEditorContent(
      this.nodeEditor.editor.drawflow
    );
    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(
        (this.host as any).editorState.selectedNode.id
      )
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  /* 
  
  */
  _deleteOutput = (event) => {
    (event as CustomEvent).stopPropagation();
    this.nodeEditor.programaticallyUnselectConnection();
    this.nodeEditor.editor.removeNodeOutput(
      event.detail.nodeId,
      event.detail.outputClass
    );

    const selectedNodeId = (this.host as any).editorState.selectedNode.id;
    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNodeId)
    );

    this.gamebookContainerManager.updateButtonIdsAfterOutputRemove(
      event.detail.nodeId,
      event.detail.outputClass
    );

    (this.host as any).editorState.setEditorContent(
      this.nodeEditor.editor.drawflow
    );

    this._markUsedOutputs();

    this.host.requestUpdate(); // Update the host component after changes
  };

  /* 
  
  */
  _addOutput = (event) => {
    (event as CustomEvent).stopPropagation();

    this.nodeEditor.editor.addNodeOutput(event.detail.nodeId);

    (this.host as any).editorState.setEditorContent(
      this.nodeEditor.editor.drawflow
    );

    const selectedNodeId = (this.host as any).editorState.selectedNode.id;
    (this.host as any).editorState.setSelectedNode(
      this.nodeEditor.editor.getNodeFromId(selectedNodeId)
    );

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  /* 
  
  */
  _highlightConnection = (event) => {
    const {
      outputNodeId,
      inputNodeId,
      outputClass,
      inputClass,
      highlightButton,
    } = event.detail;

    if (
      outputNodeId !== undefined &&
      inputNodeId !== undefined &&
      outputClass !== undefined &&
      inputClass !== undefined
    ) {
      // Proceed if all fields are valid
      this.nodeEditor._highlightConnection(
        outputNodeId,
        inputNodeId,
        outputClass,
        inputClass
      );

      const identifier = `${outputNodeId}-${outputClass}-${inputNodeId}-${inputClass}`;

      if (highlightButton) {
        this.gamebookContainerManager.highlightButtonInContainer(
          outputNodeId,
          identifier
        );
      }
    }
  };

  /* 
  
  */
  _unhighlightConnection = (event) => {
    const {
      outputNodeId,
      inputNodeId,
      outputClass,
      inputClass,
      highlightButton,
    } = event.detail;

    if (
      outputNodeId !== undefined &&
      inputNodeId !== undefined &&
      outputClass !== undefined &&
      inputClass !== undefined
    ) {
      this.nodeEditor._unhighlightConnection(
        outputNodeId,
        inputNodeId,
        outputClass,
        inputClass
      );
      const identifier = `${outputNodeId}-${outputClass}-${inputNodeId}-${inputClass}`;

      if (highlightButton) {
        this.gamebookContainerManager.unhighlightButtonInContainer(
          outputNodeId,
          identifier
        );
      }
    }
  };

  /* 
  
  */
  _highlightOutput = (event) => {
    const { outputNodeId, outputClass } = event.detail;

    if (outputNodeId !== undefined && outputClass !== undefined) {
      this.nodeEditor._highlightOutput(outputNodeId, outputClass);
    }
  };

  /* 
  
  */
  _unhighlightOutput = (event) => {
    const { outputNodeId, outputClass } = event.detail;

    if (outputNodeId !== undefined && outputClass !== undefined) {
      this.nodeEditor._unhighlightOutput(outputNodeId, outputClass);
    }
  };

  /* 
  
  */
  _highlightNode = (event) => {
    const { nodeId } = event.detail;

    if (nodeId !== undefined) {
      this.nodeEditor._highlightNode(nodeId);
    }
  };

  /* 
  
  */
  _unhighlightNode = (event) => {
    const { nodeId } = event.detail;

    if (nodeId !== undefined) {
      this.nodeEditor._unhighlightNode(nodeId);
    }
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

            if (nodeName === "webwriter-gamebook-page") {
              const container = node as WebWriterGamebookPage;
              containerDeletedEvent(container);
              if (container.originPage === 1) {
                this.nodeEditor.addPageNode("First Page", true);
              }

              if (container.branchesOff !== -1) {
                const branchContainer =
                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                    container.branchesOff
                  );

                branchContainer.incomingContainerId = -1;
                branchContainer.clearRules();
              }
            } else if (nodeName === "webwriter-gamebook-popup") {
              const container = node as WebWriterGamebookPopup;
              containerDeletedEvent(container);

              if (container.branchesOff !== -1) {
                const branchContainer =
                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                    container.branchesOff
                  );

                branchContainer.incomingContainerId = -1;
                branchContainer.clearRules();
              }
            } else if (nodeName === "webwriter-gamebook-branch") {
              const container = node as WebWriterGamebookBranch;
              containerDeletedEvent(container);
            }
          }
        });
      }
    });
  };

  /*

  */
  private parseConnectionIdentifier(identifier) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      outputClass: parts[1],
      inputNodeId: parseInt(parts[2]),
      inputClass: parts[3],
    };

    return parsed;
  }

  /*


  */
  public _markUsedOutputs() {
    // Loop through all nodes in drawflow
    const nodes = (this.host as any).editorState.editorContent.drawflow.Home
      .data;

    Object.values(nodes).forEach((node) => {
      if ((node as DrawflowNode).class == "branch") {
        if (this.gamebookContainerManager.gamebookContainers.length !== 0) {
          const branchContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              (node as DrawflowNode).id
            );
          if (branchContainer) {
            branchContainer.rules.forEach((rule) => {
              const outputElement = this.nodeEditor.shadowRoot
                ?.getElementById(`node-${(node as DrawflowNode).id}`)
                ?.querySelector(`.output.${rule.output_id}`);

              if (outputElement) {
                if (!rule.isTargetEnabled) {
                  outputElement?.setAttribute("target-disabled", "true");
                  outputElement?.removeAttribute("has-error");
                }
                //
                else {
                  if (
                    (node as DrawflowNode).outputs[rule.output_id].connections
                      .length > 0
                  ) {
                    // If the output has at least one connection, mark it as in use
                    outputElement.setAttribute("in-use", "true");
                    outputElement?.removeAttribute("target-disabled");
                  } else {
                    // If the output has no connections, remove the in-use class
                    outputElement.removeAttribute("in-use");
                    outputElement?.removeAttribute("target-disabled");
                  }
                }
              }
            });

            if (branchContainer.elseRule) {
              const elseRuleOutputElement = this.nodeEditor.shadowRoot
                ?.getElementById(`node-${(node as DrawflowNode).id}`)
                ?.querySelector(
                  `.output.${branchContainer.elseRule?.output_id}`
                );

              if (elseRuleOutputElement) {
                if (
                  (node as DrawflowNode).outputs[
                    branchContainer.elseRule?.output_id
                  ]?.connections.length > 0
                ) {
                  // If the output has at least one connection, mark it as in use
                  elseRuleOutputElement?.setAttribute("in-use", "true");
                  elseRuleOutputElement?.removeAttribute("target-disabled");
                  elseRuleOutputElement?.removeAttribute("has-error");
                } else {
                  // If the output has no connections, remove the in-use class
                  elseRuleOutputElement?.removeAttribute("in-use");
                  elseRuleOutputElement?.removeAttribute("target-disabled");
                  elseRuleOutputElement?.setAttribute("has-error", "true");
                }
              }
            }
          }
        }
      }
      //
      else {
        Object.entries((node as DrawflowNode).outputs).forEach(
          ([outputClass, output]) => {
            // Get the element corresponding to the output
            const outputElement = this.nodeEditor.shadowRoot
              ?.getElementById(`node-${(node as DrawflowNode).id}`)
              ?.querySelector(`.output.${outputClass}`);
            if (outputElement) {
              if (output.connections.length > 0) {
                // If the output has at least one connection, mark it as in use
                outputElement.setAttribute("in-use", "true");
              } else {
                // If the output has no connections, remove the in-use class
                outputElement.removeAttribute("in-use");
              }
            }
          }
        );
      }
    });
  }

  /*


  */
  public nodeSearch() {
    let inputText = (this.host as any).editorState.searchTerm;

    if (inputText != "") {
      let nodeIncludes = [
        ...new Set([
          ...this.nodeEditor.searchNodes(inputText),
          ...this.gamebookContainerManager.searchContainers(inputText),
        ]),
      ];

      (this.host as any).editorState.setSearchResults(nodeIncludes);

      this.nodeEditor.highlightSearchedNodes(nodeIncludes);
    } else {
      (this.host as any).editorState.setSearchResults();
      this.nodeEditor.removeSearchHighlightFromAllNodes();
    }

    this.host.requestUpdate(); // Update the host component after changes
  }

  /*


  */
  public moveTo(node: DrawflowNode) {
    this.nodeEditor.moveToNode(node, true);
    this._selectContainer(node.id);
    this.nodeEditor.programaticallySelectNode(node.id);
  }
}
