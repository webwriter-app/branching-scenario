import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";

import { repeat } from "lit/directives/repeat.js";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js";

//Drawflow Imports
import { DrawflowNode } from "drawflow";

import { QuickConnectNode } from "../ui-components/quick-connect-node";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlButton,
  SlDivider,
  SlIcon,
  SlIconButton,
  SlInput,
  SlOption,
  SlSelect,
} from "@shoelace-style/shoelace";

//CSS
import styles from "../../css/branch-node-details-css";

//Tabler
import plus from "@tabler/icons/outline/plus.svg";
import minus from "@tabler/icons/outline/minus.svg";
import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";
import { GamebookContainerManager } from "../gamebook-container-manager";
import { WebWriterGamebookBranchContainer } from "../gamebook-components/webwriter-gamebook-branch-container";
import { OutputConnectionControl } from "../ui-components/output-connection-control";
import { ContainerElementSelect } from "../ui-components/container-element-select";

@customElement("branch-node-details")
export class BranchNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-icon-button": SlIconButton,
      "sl-icon": SlIcon,
      "sl-select": SlSelect,
      "sl-input": SlInput,
      "sl-option": SlOption,
      "sl-divider": SlDivider,
      "quick-connect-node": QuickConnectNode,
      "output-connection-control": OutputConnectionControl,
      "container-element-select": ContainerElementSelect,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @property({ type: Object }) accessor nodeEditor;
  @property({ type: Boolean }) accessor isNodeSelected = false;

  @property({ type: Boolean }) accessor isConnected = false;

  //public properties are part of the component's public API
  @property({ type: Object, attribute: false })
  accessor selectedNode: DrawflowNode;

  @property({ type: Object, attribute: false })
  accessor branchContainer: WebWriterGamebookBranchContainer;

  @property({ type: Object, attribute: false })
  accessor incomingContainer;

  @property({ type: Number }) accessor ruleDrag = false;
  private draggedIndex = -1;

  @property({ type: Number }) accessor hoveredDividerIndex = -1;

  @property({ attribute: false }) accessor changeInEditorCallback = (
    drawflow,
    updateType,
    node?,
    removedNodeId?,
    inputNode?,
    outputNode?,
    inputClass?,
    outputClass?,
    outputHadConnections?
  ) => {};

  // Query elements assigned to the default slot
  @queryAssignedElements({
    flatten: true,
  })
  accessor slotElements;

  //

  //
  protected updated(_changedProperties: PropertyValues): void {
    const gamebookContainerManager = this
      .slotElements[0] as GamebookContainerManager;

    this.branchContainer =
      gamebookContainerManager._getContainerByDrawflowNodeId(
        this.selectedNode.id.toString()
      );

    const incomingNodeId =
      this.selectedNode.inputs["input_1"].connections?.[0]?.node;

    if (this.branchContainer) {
      this.branchContainer.incomingContainerDrawflowNodeId = incomingNodeId;
    }
    if (incomingNodeId != undefined) {
      this.isConnected = true;
      this.incomingContainer =
        gamebookContainerManager._getContainerByDrawflowNodeId(
          incomingNodeId.toString()
        );
    } else {
      this.isConnected = false;
    }
  }

  //TODO: dialog before deletion of incoming connection
  //TODO: delete all rules when incoming connection is broken
  //TODO: make it such that the smart branch looks visually different
  //TODO: Make output-connection-control css and placeholder of select visually changeable dependent on use case
  //TODO: different elements should offer different conditions as options per rule
  //TODO: make rules moveable, since indexing gives priority of what will be done
  //TODO: also move outputs accordingly
  //TODO: delete connection once the matching has been cleared

  render() {
    return html`
      <div class="container">
        ${this.isConnected
          ? html` <div class="titlebar">
                <p class="title">
                  Rules (${this.branchContainer.rules.length.toString()})
                </p>
                <sl-icon-button
                  src=${plus}
                  class="add"
                  @click=${() => this._addEmptyRuleToBranchContainer()}
                  ?disabled=${!this.isConnected}
                >
                </sl-icon-button>
              </div>

              <div class="ruleList">
                ${this.branchContainer.rules.length > 0
                  ? html`
                      ${repeat(
                        this.branchContainer.rules,
                        (rule, index) => html`
                          <!-- top divider  -->
                          <sl-divider
                            class="rule-divider"
                            style="
                            visibility: ${this.draggedIndex == -1 ||
                            index > this.draggedIndex ||
                            index == this.draggedIndex
                              ? "hidden"
                              : "visible"};
                              opacity: ${this.hoveredDividerIndex == index
                              ? "100%"
                              : "0%"};  
                              "
                          ></sl-divider>
                          <!--   -->
                          <div
                            class="horizontalStack"
                            id="horizontal-stack-${index}"
                            draggable="true"
                            @dragstart=${(e: DragEvent) =>
                              this._onDragStart(e, index)}
                            @dragend=${this._onDragEnd}
                            @dragover=${(e: DragEvent) =>
                              this._onDragOver(e, index)}
                            @dragleave=${(e: DragEvent) =>
                              this._onDragLeave(e, index)}
                          >
                            <sl-icon
                              class="draggable"
                              src=${gripHorizontal}
                              style="font-size: 15px;"
                            ></sl-icon>
                            <p>${index}</p>

                            <!-- TODO: incomingContainer is set during updating and this sometimes returns null, causing an undefined error in the container element select -->
                            ${this.incomingContainer != undefined
                              ? html` <container-element-select
                                  .value=${rule.element}
                                  @sl-change=${(e: Event) =>
                                    this._updateRuleElement(
                                      index,
                                      (
                                        e.target as ContainerElementSelect
                                      ).selectElement.value.toString()
                                    )}
                                  .selectedNode=${this.selectedNode}
                                  .container=${this.incomingContainer}
                                >
                                </container-element-select>`
                              : null}

                            <sl-select
                              clearable
                              placeholder="Condition"
                              value=${rule.condition}
                              @sl-change=${(e: Event) =>
                                this._updateRuleCondition(
                                  index,
                                  (e.target as HTMLSelectElement).value
                                )}
                              ?disabled=${!rule.isConditionEnabled}
                            >
                              <sl-option value="contains">Contains</sl-option>
                              <sl-option value="not_contains"
                                >Not Contains</sl-option
                              >
                            </sl-select>

                            <sl-input
                              clearable
                              placeholder="Match"
                              value=${rule.match}
                              @sl-input=${(e: Event) =>
                                this._updateRuleMatch(
                                  index,
                                  (e.target as HTMLInputElement).value
                                )}
                              ?disabled=${!rule.isMatchEnabled}
                            ></sl-input>

                            <output-connection-control
                              @sl-change=${(e: Event) =>
                                this._updateRuleTarget(
                                  index,
                                  (
                                    e.target as OutputConnectionControl
                                  ).selectElement.value.toString()
                                )}
                              .selectedNode=${this.selectedNode}
                              .nodeEditor=${this.nodeEditor}
                              .outputClass=${rule.output_id}
                              ?disabled=${!rule.isTargetEnabled}
                            ></output-connection-control>

                            <sl-icon-button
                              class="minus"
                              src=${minus}
                              style="font-size: 15px;"
                              @click=${() =>
                                this._removeRuleFromSelectedBranchNode(
                                  rule.output_id
                                )}
                            ></sl-icon-button>
                          </div>
                          <!-- bottom divider -->
                          <sl-divider
                            class="rule-divider"
                            style="
                           visibility: ${this.draggedIndex == -1 ||
                            index < this.draggedIndex ||
                            index == this.draggedIndex
                              ? "hidden"
                              : "visible"};
                            opacity: ${this.hoveredDividerIndex == index
                              ? "100%"
                              : "0%"};
                            "
                          ></sl-divider>
                          <!--  -->
                        `
                      )}
                    `
                  : html`<p class="no-node">Click + to create a rule</p>`}
              </div>`
          : html` <p class="no-node">
              Incoming node required to create rules for branching
            </p>`}
        <slot></slot>
      </div>
    `;
  }

  /*


  */
  private _onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;

    const stackElement = this.shadowRoot?.getElementById(
      `horizontal-stack-${index}`
    );
    if (stackElement) {
      stackElement.classList.add("dragging");
    }
    this.requestUpdate();
  }

  /*


  */
  private _onDragEnd() {
    if (this.draggedIndex !== -1) {
      const stackElement = this.shadowRoot?.getElementById(
        `horizontal-stack-${this.draggedIndex}`
      );
      if (stackElement) {
        stackElement.classList.remove("dragging");
      }
    }
    this.draggedIndex = -1; // Reset dragged index
    this.hoveredDividerIndex = -1; // Reset hovered divider index
    this.requestUpdate();
  }

  /*


  */
  private _onDragOver(event: DragEvent, index: number) {
    event.preventDefault();

    this.hoveredDividerIndex = index;
    this.requestUpdate();
  }

  /*


  */
  private _onDragLeave(event: DragEvent, index: number) {
    event.preventDefault();

    this.hoveredDividerIndex = -1;
    this.requestUpdate();
  }

  /*


  */
  private _onDrop(event: DragEvent) {
    console.log("test");
    event.preventDefault();

    this.draggedIndex = -1; // Reset dragged index
    this.hoveredDividerIndex = -1; // Reset hovered divider index
    this.requestUpdate();
  }

  /*


  */
  private _addEmptyRuleToBranchContainer() {
    // Step 1: Add a new output to the node editor
    this.nodeEditor.editor.addNodeOutput(this.selectedNode.id);

    // Step 2: Trigger the callback to signal a change in the editor
    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputCreated"
    );

    // Step 3: Refresh the selected node to get the updated outputs
    this.selectedNode = this.nodeEditor.editor.getNodeFromId(
      this.selectedNode.id
    );

    // Step 4: Extract the last created output's output_class
    const outputKeys = Object.keys(this.selectedNode.outputs);
    const lastOutputClass = outputKeys[outputKeys.length - 1]; // Get the last key (latest output)

    // Step 5: Create an empty rule with the last output's output_class as output_id
    const emptyRule: Rule = {
      output_id: lastOutputClass, // Use the last output's output_class as output_id
      element: "", // Empty element
      condition: "", // Empty condition
      match: "", // Empty match
      target: "", // Empty target
      isConditionEnabled: false,
      isMatchEnabled: false,
      isTargetEnabled: false,
    };

    // Step 6: Add the empty rule to the branch container
    this.branchContainer.addRule(emptyRule);
  }

  /*


  */
  private _removeRuleFromSelectedBranchNode(output_id: any) {
    this.nodeEditor.editor.removeNodeOutput(this.selectedNode.id, output_id);

    // Step 2: Trigger the callback to signal a change in the editor
    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputCreated"
    );

    // Step 3: Refresh the selected node to get the updated outputs
    this.selectedNode = this.nodeEditor.editor.getNodeFromId(
      this.selectedNode.id
    );

    this.branchContainer.deleteRule(output_id);
  }

  /*


  */
  private _updateRuleElement(index: number, value: string) {
    this.branchContainer.rules[index].element = value;
    this.branchContainer.rules[index].isConditionEnabled = value !== "";
    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleCondition(index: number, value: string) {
    this.branchContainer.rules[index].condition = value;

    if (value !== "") {
      if (value == "contains" || value == "not_contains") {
        this.branchContainer.rules[index].isMatchEnabled = true;
      } else {
        this.branchContainer.rules[index].isTargetEnabled = true;
      }
    } else {
      this.branchContainer.rules[index].isMatchEnabled = false;
      this.branchContainer.rules[index].isTargetEnabled = false;
    }

    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleMatch(index: number, value: string) {
    this.branchContainer.rules[index].match = value;
    this.branchContainer.rules[index].isTargetEnabled = value !== "";
    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleTarget(index: number, value: string) {
    this.branchContainer.rules[index].target = value;
    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }
}
