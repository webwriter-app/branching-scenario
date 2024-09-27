import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";

import { repeat } from "lit/directives/repeat.js";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
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

import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";
import percentage from "@tabler/icons/outline/percentage.svg";
import { GamebookContainerManager } from "../gamebook-container-manager";
import { WebWriterGamebookBranchContainer } from "../gamebook-components/webwriter-gamebook-branch-container";
import { OutputConnectionControl } from "../ui-components/output-connection-control";
import { ElementChildrenSelect } from "../ui-components/container-element-select";
import { QuizTasksSelect } from "../ui-components/quiz-tasks-select";

import { ToggleableInput } from "../ui-components/toggleable-input";
import { NodeConnectionList } from "../ui-components/node-connection-list";

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
      "element-children-select": ElementChildrenSelect,
      "toggleable-input": ToggleableInput,
      "node-connection-list": NodeConnectionList,
      "quiz-tasks-select": QuizTasksSelect,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @property({ type: Object }) accessor nodeEditor;
  @property({ type: Boolean }) accessor isConnected = false;
  //public properties are part of the component's public API
  @property({ type: Object, attribute: false })
  accessor selectedNode: DrawflowNode;
  @property({ type: Object, attribute: false })
  accessor branchContainer: WebWriterGamebookBranchContainer;
  @property({ type: Object, attribute: false })
  accessor incomingContainer;
  @property({ type: Boolean }) accessor ruleDrag = false;
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

  @property({ attribute: false }) accessor markUsedOutputs = () => {};

  // Query elements assigned to the default slot
  @queryAssignedElements({
    flatten: true,
    selector: "gamebook-container-manager",
  })
  accessor gamebookContainerManager;

  //

  //
  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.branchContainer = (
      this.gamebookContainerManager[0] as GamebookContainerManager
    )._getContainerByDrawflowNodeId(this.selectedNode.id.toString());
  }
  //

  //
  protected updated(_changedProperties: PropertyValues): void {
    this.branchContainer = (
      this.gamebookContainerManager[0] as GamebookContainerManager
    )._getContainerByDrawflowNodeId(this.selectedNode.id.toString());

    // console.log(this.selectedNode.id.toString());
    // console.log(this.branchContainer);

    const incomingNodeId =
      this.selectedNode.inputs["input_1"].connections?.[0]?.node;

    if (incomingNodeId != undefined) {
      if (this.branchContainer) {
        this.branchContainer.incomingContainerDrawflowNodeId = incomingNodeId;
      }
      this.isConnected = true;
      this.incomingContainer = (
        this.gamebookContainerManager[0] as GamebookContainerManager
      )._getContainerByDrawflowNodeId(incomingNodeId.toString());
    }

    //
    else {
      //TODO: since this.selectedNode updates are coming from outside, this gets executed several times because updates are thrown together.
      //This could really profit from a @context change
      this.clearRules();
      this.isConnected = false;
    }
  }

  //TODO: dialog before deletion of incoming connection
  //TODO: dont let connection be deleted in the editor // node deletion does not clear target of rule
  //TODO: target of rules should be overwritten when connections get removed from outside forces

  render() {
    return html`
      <div class="title-bar">
        <div class="div-icon-branch">
          <sl-icon src=${arrowsSplit2}></sl-icon>
        </div>
        <div class="div-title">
          <toggleable-input
            .text=${this.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggleable-input>
          <p class="subtitle">Smart Branch</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list
            branch
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.selectedNode}
            .changeInEditorCallback=${(
              drawflow,
              updateType,
              node,
              removedNodeId,
              inputNode,
              outputNode,
              inputClass,
              outputClass,
              outputHadConnections
            ) => {
              this.changeInEditorCallback(
                drawflow,
                updateType,
                node,
                removedNodeId,
                inputNode,
                outputNode,
                inputClass,
                outputClass,
                outputHadConnections
              );
            }}
          ></node-connection-list>
        </div>
      </div>

      <div class="container">
        <div class="titlebar">
          <p
            class="title"
            style=${this.isConnected ? "color: #505055" : "color: darkgrey"}
          >
            Rules (${this.branchContainer?.rules.length.toString()})
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
          ${this.branchContainer?.rules.length > 0
            ? html`
                ${repeat(
                  this.branchContainer?.rules,
                  (rule, index) => html`
                    <!-- top divider  -->
                    <sl-divider
                      class="rule-divider"
                      style="
                            visibility: ${
                              this.draggedIndex == -1 ||
                              index > this.draggedIndex ||
                              index == this.draggedIndex
                                ? "hidden"
                                : "visible"
                            };
                              opacity: ${
                                this.hoveredDividerIndex == index
                                  ? "100%"
                                  : "0%"
                              };  
                              "
                    ></sl-divider>
                    <!--   -->
                     ${
                       this.incomingContainer != undefined
                         ? html` <div
                             class="ruleItem"
                             id="horizontal-stack-${index}"
                             draggable="true"
                             @dragstart=${(e: DragEvent) =>
                               this._onDragStart(e, index)}
                             @dragend=${this._onDragEnd}
                             @dragover=${(e: DragEvent) =>
                               this._onDragOver(e, index)}
                             @dragleave=${(e: DragEvent) =>
                               this._onDragLeave(e, index)}
                             @drop=${(e: DragEvent) => this._onDrop(e)}
                           >
                             <div
                               id="index"
                               style="min-width: 25px; display: flex; flex-direction: row; align-items: center; justify-content: center;"
                             >
                               <p
                                 style="color: darkgrey; font-size: 15px; margin-right: 15px;"
                               >
                                 ${index + 1}
                               </p>

                               <p style="color: darkgrey; font-size: 15px;">
                                 ${rule.output_id}
                               </p>
                             </div>

                             <sl-icon
                               class="draggable"
                               src=${gripHorizontal}
                               style="font-size: 15px; flex-shrink: 0"
                             ></sl-icon>

                             <!-- TODO: incomingContainer is set during updating and this sometimes returns null, causing an undefined error in the container element select -->
                             <!-- Different kinds of matches: percent etc ... -->

                             <!-- Element -->
                             <element-children-select
                               .value=${rule.elementId}
                               @sl-change=${(e: Event) =>
                                 this._updateRuleElement(
                                   index,
                                   (
                                     e.target as ElementChildrenSelect
                                   ).selectElement.value.toString()
                                 )}
                               .container=${this.incomingContainer}
                             >
                             </element-children-select>

                             <!-- Subelements -->
                             ${rule.elementId !== "" &&
                             rule.elementId !== "text" &&
                             this.incomingContainer
                               .querySelector(`#${rule.elementId}`)
                               ?.tagName.toLowerCase() == "webwriter-quiz"
                               ? html` <quiz-tasks-select
                                   .value=${rule.quizTasks.split(" ")}
                                   @sl-change=${(e: Event) =>
                                     this._updateRuleTasks(
                                       index,
                                       (
                                         e.target as ElementChildrenSelect
                                       ).selectElement.value.toString()
                                     )}
                                   .quiz=${this.incomingContainer.querySelector(
                                     `#${rule.elementId}`
                                   )}
                                 >
                                 </quiz-tasks-select>`
                               : null}

                             <!-- Condition -->
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
                               <!-- Quiz Conditions -->
                               <sl-option value="correct">Correct</sl-option>
                               <sl-option value="uncorrect"
                                 >Uncorrect</sl-option
                               >
                             </sl-select>

                             <!-- Match -->
                             ${rule.elementId !== ""
                               ? html`${this.incomingContainer
                                   .querySelector(`#${rule.elementId}`)
                                   ?.tagName?.toLowerCase() ===
                                   "webwriter-quiz" && rule.condition == ""
                                   ? html`
                                       <sl-input
                                         placeholder="Match"
                                         ?disabled=${!rule.isMatchEnabled}
                                       ></sl-input>
                                     `
                                   : this.incomingContainer
                                       .querySelector(`#${rule.elementId}`)
                                       ?.tagName.toLowerCase() ==
                                       "webwriter-quiz" &&
                                     (rule.condition == "correct" ||
                                       rule.condition == "uncorrect")
                                   ? html`<sl-input
                                       id="percent"
                                       placeholder="..."
                                       value=${rule.match}
                                       type="number"
                                       min="0"
                                       max="100"
                                       inputmode="numeric"
                                       @sl-input=${(e: Event) =>
                                         this._validateAndUpdateRuleMatch(
                                           e,
                                           index
                                         )}
                                     >
                                       <sl-icon
                                         src=${percentage}
                                         slot="prefix"
                                       ></sl-icon>
                                     </sl-input>`
                                   : null}`
                               : null}

                             <!-- Output -->
                             <output-connection-control
                               @sl-change=${(e: Event) =>
                                 this._updateRuleTarget(
                                   index,
                                   (
                                     e.target as OutputConnectionControl
                                   ).selectElement.value.toString()
                                 )}
                               .selectedNode=${this.selectedNode}
                               .incomingNodeId=${this.selectedNode.inputs[
                                 "input_1"
                               ].connections?.[0]?.node}
                               .nodeEditor=${this.nodeEditor}
                               .outputClass=${rule.output_id}
                               ?disabled=${!rule.isTargetEnabled}
                               required="true"
                             ></output-connection-control>

                             <sl-icon-button
                               class="minus"
                               src=${minus}
                               style="font-size: 15px;"
                               @click=${() =>
                                 this._removeRuleFromSelectedBranchNode(
                                   rule.output_id
                                 )}
                               ?disabled=${!this.isConnected}
                             ></sl-icon-button>
                           </div>`
                         : null
                     }
                      <!-- bottom divider -->
                      <sl-divider
                        class="rule-divider"
                        style="
                           visibility: ${
                             this.draggedIndex == -1 ||
                             index < this.draggedIndex ||
                             index == this.draggedIndex
                               ? "hidden"
                               : "visible"
                           };
                            opacity: ${
                              this.hoveredDividerIndex == index ? "100%" : "0%"
                            };
                            "
                      ></sl-divider>
                      <!--  -->
                    </div>
                  `
                )}

                <sl-divider></sl-divider>

                <!-- the else rule  -->
                <div class="ruleItem" id="horizontal-stack-else">
                  <div
                    id="index"
                    style="min-width: 25px; display: flex; flex-direction: row; align-items: center; justify-content: center;"
                  >
                    <p style="color: darkgrey; font-size: 15px;">
                      If no rule is satisfied, go to
                    </p>
                  </div>

                  <p style="color: darkgrey; font-size: 15px;">
                    ${this.branchContainer?.elseRule?.output_id}
                  </p>

                  <!-- Output -->
                  <output-connection-control
                    @sl-change=${(e: Event) =>
                      this._updateElseRuleTarget(
                        (
                          e.target as OutputConnectionControl
                        ).selectElement.value.toString()
                      )}
                    .selectedNode=${this.selectedNode}
                    .incomingNodeId=${this.selectedNode.inputs["input_1"]
                      .connections?.[0]?.node}
                    .nodeEditor=${this.nodeEditor}
                    .outputClass=${this.branchContainer?.elseRule?.output_id}
                    required="true"
                  ></output-connection-control>
                </div>
              `
            : html`<p class="no-node">No branching rules</p>`}
        </div>
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
    event.preventDefault();

    //TODO: is it possible to move connections by manipulating the connections objects and calling editor.updateConnectionNodes(id)? May make this code way shorter
    if (
      this.draggedIndex !== -1 &&
      this.hoveredDividerIndex !== -1 &&
      this.draggedIndex !== this.hoveredDividerIndex
    ) {
      //Step 1: Move outputs of node according to the moved rule
      const hoveredRuleOutput =
        this.branchContainer.rules[this.hoveredDividerIndex].output_id;
      const draggedRuleOutput =
        this.branchContainer.rules[this.draggedIndex].output_id;

      //1.1: Move connections from dragged output onto hovered output
      this.selectedNode.outputs[draggedRuleOutput].connections.forEach(
        (connection) => {
          this.nodeEditor.editor.addConnection(
            this.selectedNode.id,
            connection.node,
            hoveredRuleOutput,
            "input_1"
          );
          this.nodeEditor.editor.removeSingleConnection(
            this.selectedNode.id,
            connection.node,
            draggedRuleOutput,
            "input_1"
          );
        }
      );

      //1.2: For other rules update their outputs and connections accordingly
      this.branchContainer.rules.forEach((rule, index) => {
        const outputIdNumber = parseInt(rule.output_id.split("_")[1], 10);
        //Check if rule is between hovered and dragged rule, but not the draggedRule (we updated this in 1.1)
        if (
          outputIdNumber >=
            Math.min(
              parseInt(draggedRuleOutput.split("_")[1], 10),
              parseInt(hoveredRuleOutput.split("_")[1], 10)
            ) &&
          outputIdNumber <=
            Math.max(
              parseInt(draggedRuleOutput.split("_")[1], 10),
              parseInt(hoveredRuleOutput.split("_")[1], 10)
            ) &&
          outputIdNumber !== parseInt(draggedRuleOutput.split("_")[1], 10)
        ) {
          //1.3 Get the direction of the drag (move up or down in the array)
          //Case Up
          if (this.hoveredDividerIndex > this.draggedIndex) {
            //Move the connection to the output above
            this.selectedNode.outputs[rule.output_id].connections.forEach(
              (connection) => {
                this.nodeEditor.editor.removeSingleConnection(
                  this.selectedNode.id,
                  connection.node,
                  `output_${outputIdNumber}`,
                  "input_1"
                );

                this.nodeEditor.editor.addConnection(
                  this.selectedNode.id,
                  connection.node,
                  `output_${outputIdNumber - 1}`,
                  "input_1"
                );
              }
            );

            //Update rule reference
            this.branchContainer.rules[index].output_id = `output_${
              outputIdNumber - 1
            }`;
          }
          //Case Down
          else if (this.hoveredDividerIndex < this.draggedIndex) {
            //Move the connection to the output below
            this.selectedNode.outputs[rule.output_id].connections.forEach(
              (connection) => {
                this.nodeEditor.editor.removeSingleConnection(
                  this.selectedNode.id,
                  connection.node,
                  `output_${outputIdNumber}`,
                  "input_1"
                );

                this.nodeEditor.editor.addConnection(
                  this.selectedNode.id,
                  connection.node,
                  `output_${outputIdNumber + 1}`,
                  "input_1"
                );
              }
            );
            //Update rule reference
            this.branchContainer.rules[index].output_id = `output_${
              outputIdNumber + 1
            }`;
          }
        }
      });

      //Update rule reference of dragged Rule
      this.branchContainer.rules[this.draggedIndex].output_id =
        hoveredRuleOutput;

      //Update the rules index in the rules array according to drag by removing the rule and adding it at the drop position
      let [draggedRule] = this.branchContainer.rules.splice(
        this.draggedIndex,
        1
      );
      this.branchContainer.rules.splice(
        this.hoveredDividerIndex,
        0,
        draggedRule
      );
      //reference update to trigger re-render
      this.branchContainer.rules = [...this.branchContainer.rules];
    }

    this._onDragEnd();
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
      //else_rule: false,
      output_id: lastOutputClass, // Use the last output's output_class as output_id
      elementId: "", // Empty element
      quizTasks: "",
      condition: "", // Empty condition
      match: "", // Empty match
      target: "", // Empty target
      isConditionEnabled: false,
      isMatchEnabled: false,
      isTargetEnabled: false,
    };

    // Step 6: Add the empty rule to the branch container
    this.branchContainer.addRule(emptyRule);

    // Step 7: If no else rule exists, create one
    const hasElseRule = this.branchContainer.elseRule !== undefined;

    if (!hasElseRule) {
      this._addElseRuleToBranchContainer();
    }
    //
    else {
      this._moveElseRuleOutputToTheEnd();
    }
  }

  /*


  */
  private _moveElseRuleOutputToTheEnd() {
    const highestOutputIdIndex = this.branchContainer.rules.reduce(
      (maxIndex, currentRule, currentIndex, rulesArray) => {
        // Extract the number from output_id of the current max rule and current rule using a regular expression.
        const maxNumber = parseInt(
          rulesArray[maxIndex].output_id.split("_")[1],
          10
        );
        const currentNumber = parseInt(currentRule.output_id.split("_")[1], 10);

        // Compare and return the index of the rule with the higher number.
        return currentNumber > maxNumber ? currentIndex : maxIndex;
      },
      0
    );

    this.selectedNode.outputs[
      this.branchContainer.elseRule.output_id
    ].connections.forEach((connection) => {
      this.nodeEditor.editor.addConnection(
        this.selectedNode.id,
        connection.node,
        this.branchContainer.rules[highestOutputIdIndex].output_id,
        "input_1"
      );
      this.nodeEditor.editor.removeSingleConnection(
        this.selectedNode.id,
        connection.node,
        this.branchContainer.elseRule.output_id,
        "input_1"
      );
    });

    const elseRuleOutputId = this.branchContainer.elseRule.output_id;
    const newRuleOutputId =
      this.branchContainer.rules[highestOutputIdIndex].output_id;

    this.branchContainer.rules[highestOutputIdIndex].output_id =
      elseRuleOutputId;
    this.branchContainer.elseRule = {
      ...this.branchContainer.elseRule,
      output_id: newRuleOutputId,
    };
  }
  /*


  */
  private _addElseRuleToBranchContainer() {
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
    const elseRule: Rule = {
      output_id: lastOutputClass, // Use the last output's output_class as output_id
      elementId: "", // Empty element
      quizTasks: "",
      condition: "", // Empty condition
      match: "", // Empty match
      target: "", // Empty target
      isConditionEnabled: false,
      isMatchEnabled: false,
      isTargetEnabled: false,
    };

    // Step 6: Add the empty rule to the branch container
    this.branchContainer.addElseRule(elseRule);
  }

  /*


  */
  private _removeRuleFromSelectedBranchNode(output_id: any) {
    //console.log("try to delete output", output_id, this.selectedNode);

    this.nodeEditor.editor.removeNodeOutput(this.selectedNode.id, output_id);

    // Step 2: Trigger the callback to signal a change in the editor
    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputDeleted",
      null,
      null,
      null,
      null,
      null,
      output_id,
      null
    );

    // Step 3: Refresh the selected node to get the updated outputs
    this.selectedNode = this.nodeEditor.editor.getNodeFromId(
      this.selectedNode.id
    );

    //Step 4
    this.branchContainer.deleteRule(output_id);

    //Step 5: If its the last rule, delete it
    const noOfExistingRules = this.branchContainer.rules.length;
    if (noOfExistingRules == 0 && this.branchContainer.elseRule !== undefined) {
      this.nodeEditor.editor.removeNodeOutput(
        this.selectedNode.id,
        this.branchContainer.elseRule.output_id
      );

      // Step 2: Trigger the callback to signal a change in the editor
      this.changeInEditorCallback(
        { ...this.nodeEditor.editor.drawflow },
        "outputDeleted",
        null,
        null,
        null,
        null,
        null,
        this.branchContainer.elseRule.output_id,
        null
      );

      // Step 3: Refresh the selected node to get the updated outputs
      this.selectedNode = this.nodeEditor.editor.getNodeFromId(
        this.selectedNode.id
      );

      this.branchContainer.removeElseRule();
    }
  }

  /*


  */
  private _updateRuleElement(index: number, value: string) {
    //TODO: hier
    this.branchContainer.rules[index].elementId = value;

    if (value == "") {
      this.branchContainer.rules[index].isConditionEnabled = false;

      this._updateRuleTasks(index, "");
      this._updateRuleCondition(index, "");
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(index, "");
    }
    //
    else if (
      this.incomingContainer
        .querySelector(`#${value}`)
        ?.tagName?.toLowerCase() == "webwriter-quiz"
    ) {
      this.branchContainer.rules[index].isConditionEnabled = false;
    }
    //
    else {
      this.branchContainer.rules[index].isConditionEnabled = true;
    }

    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleTasks(index: number, value: string) {
    this.branchContainer.rules[index].isConditionEnabled = value !== "";

    if (value === "") {
      this._updateRuleCondition(index, "");
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(index, "");
    }
    this.branchContainer.rules[index].quizTasks = value.replace(/,/g, " ");
    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleCondition(index: number, value: string) {
    this.branchContainer.rules[index].condition = value;

    if (value == "") {
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(index, "");
      this.branchContainer.rules[index].isMatchEnabled = false;
      this.branchContainer.rules[index].isTargetEnabled = false;
    }
    //
    else if (
      this.incomingContainer
        .querySelector(`#${this.branchContainer.rules[index].elementId}`)
        ?.tagName?.toLowerCase() == "webwriter-quiz"
    ) {
      this.branchContainer.rules[index].isMatchEnabled = true;
    }
    //
    else {
      this.branchContainer.rules[index].isTargetEnabled = true;
    }

    this.branchContainer.rules = [...this.branchContainer.rules];
    this.markUsedOutputs();
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleMatch(index: number, value: string) {
    this.branchContainer.rules[index].match = value;
    this.branchContainer.rules[index].isTargetEnabled = value !== "";

    if (value === "") {
      this._updateRuleTarget(index, "");
    }

    this.branchContainer.rules = [...this.branchContainer.rules];
    this.markUsedOutputs();
    this.requestUpdate();
  }

  /*


  */
  private _validateAndUpdateRuleMatch(e: Event, index: number) {
    const inputElement = e.target as HTMLInputElement;
    let value = inputElement.value;

    if (value != "") {
      // Remove any non-numeric characters (this makes sure input is strictly numeric)
      value = value.replace(/[^0-9]/g, "");

      // Convert the value to a number and clamp it to the range 0-100
      let numericValue = Number(value);

      if (numericValue < 0) numericValue = 0;
      if (numericValue > 100) numericValue = 100;

      // Update the input value with the clamped number
      inputElement.value = numericValue.toString();
    }

    // Update the rule match
    this._updateRuleMatch(index, inputElement.value);
  }

  /*


  */
  private _updateRuleTarget(index: number, value: string) {
    this.branchContainer.rules[index].target = value;

    if (value == "") {
      const outputClass = this.branchContainer.rules[index].output_id;

      const connections =
        this.selectedNode?.outputs?.[outputClass]?.connections;
      this.nodeEditor.editor.removeSingleConnection(
        this.selectedNode.id,
        connections?.[0]?.node,
        outputClass,
        "input_1"
      );
    }

    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateElseRuleTarget(value: string) {
    this.branchContainer.elseRule = {
      ...this.branchContainer.elseRule,
      target: value,
    };
    console.log("target updated");
    this.requestUpdate();
  }

  /*


  */
  private renameNode(text: String) {
    this.nodeEditor.editor.updateNodeDataFromId(this.selectedNode.id, {
      ...this.selectedNode.data,
      title: text,
    });

    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "nodeRenamed",
      this.selectedNode
    );
  }

  /*

  */
  private clearRules() {
    Object.keys(this.selectedNode.outputs).forEach((key) => {
      this._removeRuleFromSelectedBranchNode(key);
    });
  }
}
