import type { ReactiveController } from "lit";

import type { NodeEditor, OutputState } from "./node-editor";
import type { GamebookContainerManager } from "./gamebook-container-manager";
import type { DiagramNode } from "../model/diagram";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import { isBranch, type GamebookContainerElement } from "./gamebook-container";
import type { WebwriterBranchingScenario } from "../widgets/webwriter-branching-scenario";
import type { WebwriterGamebookBranch } from "../widgets/webwriter-gamebook-branch";
import type { WebwriterGamebookPage } from "../widgets/webwriter-gamebook-page";
import type { WebwriterGamebookPopup } from "../widgets/webwriter-gamebook-popup";


export class GamebookEditorController implements ReactiveController {
  private host: WebwriterBranchingScenario;
  nodeEditor: NodeEditor;
  gamebookContainerManager: GamebookContainerManager;
  mutationObserver: MutationObserver;

  constructor(host: WebwriterBranchingScenario) {
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

  hostConnected() {
    this.mutationObserver = new MutationObserver(
      this.monitorHostUserContainerDeletion
    );
    const config = { childList: true };
    // Start observing the target node for configured mutations
    this.mutationObserver.observe(this.host, config);
  }

  hostDisconnected() {
    this.mutationObserver?.disconnect();
  }

  _selectContainer = (id: number, setFocus: boolean = true) => {
    const node = this.nodeEditor.diagram.node(id);
    if (!node) return;

    const foundContainer = this.gamebookContainerManager._showGamebookContainerById(
      Number(id)
    );

    const container =
      this.gamebookContainerManager._getContainerByDrawflowNodeId(Number(id));

    if (foundContainer && container) {
      this.host.editorState.setSelectedContainer(container);

      if (node.class === "branch" && isBranch(container)) {
        if (container.incomingContainerId !== -1) {
          const incomingContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              container.incomingContainerId
            );

          if (incomingContainer) {
            this.host.editorState.setBranchIncomingContainer(
              incomingContainer
            );
            this.host.editorState.setSelectedNode(node);
          }
        } else {
          this.host.editorState.setSelectedNode(node);
        }
      } else {
        this.host.editorState.setSelectedNode(node);
      }
    } else {
      this._unselectContainer();
			this.host.editorState.setSelectedNode(node);
			this.host.editorState.setSelectedContainer();
			this.gamebookContainerManager._hideAllGamebookContainers();
    }

    this.nodeEditor.unhighlightAllOutputs();

    if (setFocus) {
      this.host.focus();
    }
    this.host.requestUpdate(); // Update the host component after changes
  };

  _unselectContainer = () => {
    this.host.editorState.setSelectedNode();
    this.gamebookContainerManager._hideAllGamebookContainers();

    this.host.editorState.setSelectedContainer();
    this.host.editorState.setBranchIncomingContainer();

    this.nodeEditor.unhighlightAllOutputs();

    this.host.requestUpdate(); // Update the host component after changes
  };

  _recreateContainerForSelectedNode = () => {
    const selectedNode = this.host.editorState.selectedNode;
    if (selectedNode && selectedNode.id !== -1) {
      const container = this._createContainerForNode(selectedNode);

      if (selectedNode.class === "branch") {
        const branchContainer = container as WebwriterGamebookBranch;

        if (selectedNode.inputs["input_1"].connections.length > 0) {
          const incomingNodeId =
            selectedNode.inputs["input_1"].connections[0].node;
          branchContainer.setAttribute("incomingContainerId", incomingNodeId);
        }

        // Remove all outputs and their connections since we cannot determine which rule corresponded to which output
        // Always remove "output_1" because the outputs are renumbered after each removal
        const outputCount = Object.keys(selectedNode.outputs).length;
        for (let i = 0; i < outputCount; i++) {
          this.nodeEditor.diagram.removeOutput(selectedNode.id, "output_1");
        }

        this.host.editorState.setEditorContent(
          this.nodeEditor.diagram.export()
        );
        this.host.editorState.setSelectedNode(
          this.nodeEditor.diagram.node(selectedNode.id)
        );
      } else {
        // Recreate connection buttons
        for (const [outputClass, output] of Object.entries(selectedNode.outputs)) {
          for (const connection of output.connections) {
            const targetNode = this.nodeEditor.diagram.node(connection.node);
            if (!targetNode) continue;

            if (targetNode.class === "branch") {
              this.gamebookContainerManager.addSmartBranchButtonToContainer(
                selectedNode,
                targetNode,
                outputClass,
                connection.output
              );
            } else {
              this.gamebookContainerManager.addConnectionButtonToContainer(
                selectedNode,
                targetNode,
                outputClass,
                connection.output
              );
            }
          }
        }
      }
      
      this._selectContainer(selectedNode.id);
    }
  };

  _renameSelectedNode = (title: string) => {
    const selectedNode = this.host.editorState.selectedNode;

    this.nodeEditor.diagram.setData(selectedNode.id, {
      ...selectedNode.data,
      title: title,
    });

    this.gamebookContainerManager._renameContainer(selectedNode.id, title);

    this.host.editorState.setEditorContent(
      this.nodeEditor.diagram.export()
    );

    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNode.id)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  _createConnection = (event: CustomEvent) => {
    event.stopPropagation();

    const selectedNodeId = this.host.editorState.selectedNode.id;

    this.nodeEditor.diagram.addConnection({
      outputId: Number(event.detail.outputNodeId),
      inputId: Number(event.detail.inputNodeId),
      outputClass: event.detail.outputClass,
      inputClass: event.detail.inputClass,
    });

    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNodeId)
    );

    this._markUsedOutputs();

    this.host.requestUpdate(); // Update the host component after changes
  };

  _deleteConnection = (event: CustomEvent) => {
    event.stopPropagation();

    this.nodeEditor.programaticallyUnselectConnection();

    const selectedNodeId = this.host.editorState.selectedNode.id;

    this.nodeEditor.diagram.removeConnection(
      event.detail.outputNodeId,
      event.detail.inputNodeId,
      event.detail.outputClass,
      "input_1"
    );

    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNodeId)
    );

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _createContainerForNode = (node: DiagramNode) => {
    this.host.focus();
    const container =
      this.gamebookContainerManager.createContainerFromNode(node);
    if (container) this.host.appendChild(container);
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
    this.host.focus(); // Update the host component after changes
    return container;
  };

  _deleteSelectedNode = () => {
    this.nodeEditor.renderRoot.querySelector<SlDialog>("#delete_node_dialog")?.show();
  };

  _copyAndPasteContainer = (pastedNode: DiagramNode) => {
    this.host.focus();

    const pastedContainer =
      this.gamebookContainerManager.copyAndPasteContainerContents(pastedNode);

    if (pastedContainer) this.host.appendChild(pastedContainer);
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _pasteNode = () => {
    this.nodeEditor.pasteNode();
    this.host.requestUpdate(); // Update the host component after changes
  };
  _removeContainer = (id: number) => {
    this.host.focus();
    this._markUsedOutputs();
    this.gamebookContainerManager._deleteGamebookContainersById(id);
    this.host.requestUpdate(); // Update the host component after changes
  };

  _removeNode = (id: number) => {
    this.host.focus();
    this.nodeEditor.diagram.removeNode(id);
    this._unselectContainer();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _addSmartBranchButton = (event: CustomEvent) => {
    this.gamebookContainerManager.addSmartBranchButtonToContainer(
      event.detail.outputNode,
      event.detail.inputNode,
      event.detail.outputClass,
      event.detail.inputClass
    );
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _addConnectionButton = (event: CustomEvent) => {
    this.gamebookContainerManager.addConnectionButtonToContainer(
      event.detail.outputNode,
      event.detail.inputNode,
      event.detail.outputClass,
      event.detail.inputClass
    );
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _branchNodeConnected = (event: CustomEvent) => {
    this.gamebookContainerManager.updateBranchContainerRuleTarget(
      event.detail.outputNode.id,
      event.detail.outputClass,
      event.detail.inputNode.id
    );
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _outputBranchNodeConnectionRemove = (event: CustomEvent) => {
    const selectedNodeId = this.host.editorState.selectedNode.id;

    this.gamebookContainerManager.updateBranchContainerRuleTarget(
      event.detail.outputNode.id,
      event.detail.outputClass,
      ""
    );
    this._markUsedOutputs();

    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNodeId)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  _deleteBranchRuleElementAndConnection = (event: CustomEvent) => {
    const removeConnectionsFromOutputs =
      this.gamebookContainerManager.removeBranchContainerRuleElements(
        event.detail.containerId,
        event.detail.id,
        event.detail.isQuiz
      );
    for (let outputTargetTuple of removeConnectionsFromOutputs) {
      this.nodeEditor.diagram.removeConnection(
        event.detail.containerId,
        outputTargetTuple[1],
        outputTargetTuple[0],
        "input_1"
      );
    }

    this.host.requestUpdate(); // Update the host component after changes
  };

  _removeButton = (event: CustomEvent) => {
    this.gamebookContainerManager.removeButtonFromContainer(
      event.detail.outputNode.id,
      event.detail.inputNode.id,
      event.detail.outputClass,
      event.detail.inputClass
    );

    if (
      this.host.editorState.selectedNode.id ===
      event.detail.inputNode.id
    ) {
      this._selectContainer(event.detail.inputNode.id);
    } else if (
      this.host.editorState.selectedNode.id ===
      event.detail.outputNode.id
    ) {
      this._selectContainer(event.detail.outputNode.id);
    }

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _removeConnection = (event: CustomEvent) => {
    const selectedNodeId = this.host.editorState.selectedNode.id;

    const identifier = event.detail.identifier;
    const parsed = this.parseConnectionIdentifier(identifier);

    this.nodeEditor.programaticallyUnselectConnection();

    this.nodeEditor.diagram.removeConnection(
      parsed.outputNodeId,
      parsed.inputNodeId,
      parsed.outputClass,
      parsed.inputClass
    );

    const inputNode = this.nodeEditor.diagram.node(parsed.inputNodeId);
    if (inputNode?.class === "branch") {
      const branchContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          parsed.inputNodeId
        );

      if (branchContainer && isBranch(branchContainer)) {
        const incomingContainer =
          this.gamebookContainerManager._getContainerByDrawflowNodeId(
            branchContainer.incomingContainerId
          );

        if (incomingContainer && !isBranch(incomingContainer)) {
          incomingContainer.branchesOff = -1;
        }

        branchContainer.incomingContainerId = -1;

        branchContainer.clearRules();
      }
    }

    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNodeId)
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  _editorCleared = () => {
    this.gamebookContainerManager._deleteAllGamebookContainers();
    this._unselectContainer();
    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _selectConnectionButton = (event: CustomEvent) => {
    const identifier = `${event.detail.outputNode.id}-${event.detail.outputClass}-${event.detail.inputNode.id}-${event.detail.inputClass}`;

    this.gamebookContainerManager.selectButtonInContainer(
      this.host.editorState.selectedNode.id,
      identifier
    );
    this.host.requestUpdate(); // Update the host component after changes
  };

  _unselectConnectionButton = () => {
    this.host.requestUpdate(); // Update the host component after changes
  };

  _importTemplateContainers = (event: CustomEvent) => {
    const containers = this.gamebookContainerManager.importContainers(
      event.detail.templateContainers
    );

    containers.forEach((container) => {
      this.host.appendChild(container);
    });

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _changeOrigin = (event: CustomEvent) => {
    this.nodeEditor.makeNodeOrigin(event.detail.newId);

    this.gamebookContainerManager.changeOrigin(event.detail.newId);

    this.host.editorState.setEditorContent(
      this.nodeEditor.diagram.export()
    );
    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(
        this.host.editorState.selectedNode.id
      )
    );

    this.host.requestUpdate(); // Update the host component after changes
  };

  _deleteOutput = (event: CustomEvent) => {
    event.stopPropagation();
    this.nodeEditor.programaticallyUnselectConnection();
    this.nodeEditor.diagram.removeOutput(
      event.detail.nodeId,
      event.detail.outputClass
    );

    const selectedNodeId = this.host.editorState.selectedNode.id;
    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNodeId)
    );

    this.gamebookContainerManager.updateButtonIdsAfterOutputRemove(
      event.detail.nodeId,
      event.detail.outputClass
    );

    this.host.editorState.setEditorContent(
      this.nodeEditor.diagram.export()
    );

    this._markUsedOutputs();

    this.host.requestUpdate(); // Update the host component after changes
  };

  _addOutput = (event: CustomEvent) => {
    event.stopPropagation();

    this.nodeEditor.diagram.addOutput(event.detail.nodeId);

    this.host.editorState.setEditorContent(
      this.nodeEditor.diagram.export()
    );

    const selectedNodeId = this.host.editorState.selectedNode.id;
    this.host.editorState.setSelectedNode(
      this.nodeEditor.diagram.node(selectedNodeId)
    );

    this._markUsedOutputs();
    this.host.requestUpdate(); // Update the host component after changes
  };

  _highlightConnection = (event: CustomEvent) => {
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
      this.nodeEditor.highlightConnection({
        outputId: Number(outputNodeId),
        inputId: Number(inputNodeId),
        outputClass,
        inputClass,
      });

      const identifier = `${outputNodeId}-${outputClass}-${inputNodeId}-${inputClass}`;

      if (highlightButton) {
        this.gamebookContainerManager.highlightButtonInContainer(
          outputNodeId,
          identifier
        );
      }
    }
  };

  _unhighlightConnection = (event: CustomEvent) => {
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
      this.nodeEditor.unhighlightConnection({
        outputId: Number(outputNodeId),
        inputId: Number(inputNodeId),
        outputClass,
        inputClass,
      });
      const identifier = `${outputNodeId}-${outputClass}-${inputNodeId}-${inputClass}`;

      if (highlightButton) {
        this.gamebookContainerManager.unhighlightButtonInContainer(
          outputNodeId,
          identifier
        );
      }
    }
  };

  _highlightOutput = (event: CustomEvent) => {
    const { outputNodeId, outputClass } = event.detail;

    if (outputNodeId !== undefined && outputClass !== undefined) {
      this.nodeEditor.highlightOutput(Number(outputNodeId), outputClass);
    }
  };

  _unhighlightOutput = (event: CustomEvent) => {
    const { outputNodeId, outputClass } = event.detail;

    if (outputNodeId !== undefined && outputClass !== undefined) {
      this.nodeEditor.unhighlightOutput(Number(outputNodeId), outputClass);
    }
  };

  _highlightNode = (event: CustomEvent) => {
    const { nodeId } = event.detail;

    if (nodeId !== undefined) {
      this.nodeEditor.highlightNode(Number(nodeId));
    }
  };

  _unhighlightNode = (event: CustomEvent) => {
    const { nodeId } = event.detail;

    if (nodeId !== undefined) {
      this.nodeEditor.unhighlightNode();
    }
  };

  private monitorHostUserContainerDeletion = (
    mutationList: MutationRecord[]
  ) => {
    if (!this.nodeEditor || !this.gamebookContainerManager) return;
    mutationList.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const nodeName = (node as HTMLElement).nodeName.toLowerCase();
          const isWidget = (node as HTMLElement).classList.contains(
            "ww-widget"
          );
          // "ProseMirror-selectednode" css class confirms that the element is actively selected by the user
          const isSelectedNode = (node as HTMLElement).classList.contains(
            "ProseMirror-selectednode"
          );

          if (isWidget && isSelectedNode) {
            const containerDeletedEvent = (container: GamebookContainerElement) => {
              this.gamebookContainerManager._notifyContainerGotDeleted(
                Number(container.drawflowNodeId)
              );
            };

            if (nodeName === "webwriter-gamebook-page") {
              const container = node as WebwriterGamebookPage;
              containerDeletedEvent(container);
              if (container.originPage === 1) {
                this.nodeEditor.addNode("origin", this.nodeEditor.msg("First Page"));
              }

              if (container.branchesOff !== -1) {
                const branchContainer =
                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                    container.branchesOff
                  );

                if (branchContainer && isBranch(branchContainer)) {
                  branchContainer.incomingContainerId = -1;
                  branchContainer.clearRules();
                }
              }
            } else if (nodeName === "webwriter-gamebook-popup") {
              const container = node as WebwriterGamebookPopup;
              containerDeletedEvent(container);

              if (container.branchesOff !== -1) {
                const branchContainer =
                  this.gamebookContainerManager._getContainerByDrawflowNodeId(
                    container.branchesOff
                  );

                if (branchContainer && isBranch(branchContainer)) {
                  branchContainer.incomingContainerId = -1;
                  branchContainer.clearRules();
                }
              }
            } else if (nodeName === "webwriter-gamebook-branch") {
              const container = node as WebwriterGamebookBranch;
              containerDeletedEvent(container);
            }
          }
        });
      }
    });
  };

  private parseConnectionIdentifier(identifier: string) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      outputClass: parts[1],
      inputNodeId: parseInt(parts[2]),
      inputClass: parts[3],
    };

    return parsed;
  }

  /** Tells the node editor which outputs are connected, disabled or missing their target. */
  public _markUsedOutputs() {
    const states = new Map<string, OutputState>();
    const nodes = this.host.editorState.editorContent?.drawflow.Home.data ?? {};

    for (const node of Object.values(nodes)) {
      if (node.class !== "branch") {
        for (const [outputClass, output] of Object.entries(node.outputs)) {
          states.set(`${node.id}:${outputClass}`, { inUse: output.connections.length > 0 });
        }
        continue;
      }
      if (this.gamebookContainerManager.gamebookContainers.length === 0) continue;
      const branchContainer = this.gamebookContainerManager._getContainerByDrawflowNodeId(node.id);
      if (!branchContainer || !isBranch(branchContainer)) continue;
      const connected = (outputClass: string) => (node.outputs[outputClass]?.connections.length ?? 0) > 0;

      for (const rule of branchContainer.rules) {
        states.set(
          `${node.id}:${rule.output_id}`,
          rule.isTargetEnabled ? { inUse: connected(rule.output_id) } : { targetDisabled: true }
        );
      }
      const elseRule = branchContainer.elseRule;
      if (elseRule) {
        const inUse = connected(elseRule.output_id);
        states.set(`${node.id}:${elseRule.output_id}`, { inUse, hasError: !inUse });
      }
    }
    this.nodeEditor.outputStates = states;
  }

  public nodeSearch() {
    let inputText = this.host.editorState.searchTerm;

    if (inputText != "") {
      let nodeIncludes = [
        ...new Set([
          ...this.nodeEditor.searchNodes(inputText),
          ...this.gamebookContainerManager.searchContainers(inputText),
        ]),
      ];

      this.host.editorState.setSearchResults(nodeIncludes);

      this.nodeEditor.highlightSearchedNodes(nodeIncludes);
    } else {
      this.host.editorState.setSearchResults();
      this.nodeEditor.removeSearchHighlightFromAllNodes();
    }

    this.host.requestUpdate(); // Update the host component after changes
  }

  public moveTo(node: DiagramNode) {
    this.nodeEditor.moveToNode(node, true);
    this._selectContainer(node.id);
    this.nodeEditor.programaticallySelectNode(node.id);
  }

  public _selectWwSelectedNode(id: number) {
    const node = this.nodeEditor.diagram.node(id);
    if (!node) return;
    this.nodeEditor.moveToNode(node, true);
    // Do not set focus to the host to avoid changing the ProseMirror selection
    this._selectContainer(node.id, false);
    this.nodeEditor.programaticallySelectNode(node.id);
  }
}
