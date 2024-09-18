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

  // Query elements assigned to the default slot
  @queryAssignedElements({
    flatten: true,
    selector: "gamebook-container-manager",
  })
  accessor gamebookContainerManager;

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.branchContainer = (
      this.gamebookContainerManager[0] as GamebookContainerManager
    )._getContainerByDrawflowNodeId(this.selectedNode.id.toString());
  }
  //

  //
  protected updated(_changedProperties: PropertyValues): void {
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
  //TODO: make it such that the smart branch looks visually different
  //TODO: different elements should offer different conditions as options per rule
  //TODO: also move outputs accordingly
  //TODO: delete connection once the matching has been cleared

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
                         ? html` <!--  -->
                             <div
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
                                 <p style="color: darkgrey; font-size: 15px;">
                                   ${index}
                                 </p>
                               </div>

                               <sl-icon
                                 class="draggable"
                                 src=${gripHorizontal}
                                 style="font-size: 15px; flex-shrink: 0"
                               ></sl-icon>

                               <!-- TODO: incomingContainer is set during updating and this sometimes returns null, causing an undefined error in the container element select -->
                               <!-- TODO: Make different types of rules for different types of elements -->
                               <!-- TODO: inlcude conditions for quiz: right (match), wrong (match), contains (match), ... -->
                               <!-- See what quiz types are possible, how they match how to determine right wrong, contains, etc. -->
                               <!-- Different kinds of matches: percent etc ... -->
                               <!-- Specific subtasks of tasks?? -->
                               <!-- TODO: Snippets allow direct Task without QUiz First -->

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
                                 <!-- Text Conditions -->
                                 ${rule.elementId == "text"
                                   ? html` <sl-option value="contains"
                                         >Contains</sl-option
                                       >
                                       <sl-option value="not_contains"
                                         >Not Contains</sl-option
                                       >`
                                   : null}

                                 <!-- Quiz Conditions -->
                                 ${rule.elementId !== "" &&
                                 rule.elementId !== "text" &&
                                 this.incomingContainer
                                   .querySelector(`#${rule.elementId}`)
                                   ?.tagName.toLowerCase() == "webwriter-quiz"
                                   ? html`
                                       <sl-option value="correct"
                                         >Correct</sl-option
                                       >
                                       <sl-option value="uncorrect"
                                         >Uncorrect</sl-option
                                       >
                                     `
                                   : null}
                               </sl-select>

                               <!-- Match -->
                               ${rule.condition == ""
                                 ? html`
                                     <sl-input
                                       placeholder="Match"
                                       ?disabled=${!rule.isMatchEnabled}
                                     ></sl-input>
                                   `
                                 : rule.condition == "correct" ||
                                   rule.condition == "uncorrect"
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
                                 : rule.condition == "contains" ||
                                   rule.condition == "not_contains"
                                 ? html` <sl-input
                                     clearable
                                     placeholder="Text"
                                     value=${rule.match}
                                     @sl-input=${(e: Event) =>
                                       this._updateRuleMatch(
                                         index,
                                         (e.target as HTMLInputElement).value
                                       )}
                                   ></sl-input>`
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

  TODO: move outputs as well
  */
  private _onDrop(event: DragEvent) {
    event.preventDefault();

    if (
      this.draggedIndex !== -1 &&
      this.hoveredDividerIndex !== -1 &&
      this.draggedIndex !== this.hoveredDividerIndex
    ) {
      const [draggedRule] = this.branchContainer.rules.splice(
        this.draggedIndex,
        1
      ); // Remove the dragged item
      this.branchContainer.rules.splice(
        this.hoveredDividerIndex,
        0,
        draggedRule
      ); // Insert it at the drop position
      this.branchContainer.rules = [...this.branchContainer.rules]; // Trigger re-render
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
  }

  /*


  */
  private _removeRuleFromSelectedBranchNode(output_id: any) {
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

    this.branchContainer.deleteRule(output_id);
  }

  /*


  */
  private _updateRuleElement(index: number, value: string) {
    this.branchContainer.rules[index].elementId = value;
    this.branchContainer.rules[index].isConditionEnabled = value !== "";

    if (value == "") {
      this.branchContainer.rules[index].quizTasks = "";
    } else if (
      this.incomingContainer
        .querySelector(`#${value}`)
        ?.tagName?.toLowerCase() != "webwriter-quiz"
    ) {
      this.branchContainer.rules[index].quizTasks = "";
    }

    this.branchContainer.rules = [...this.branchContainer.rules];
    this.requestUpdate();
  }

  /*


  */
  private _updateRuleTasks(index: number, value: string) {
    this.branchContainer.rules[index].quizTasks = value.replace(/,/g, " ");
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
  private _validateAndUpdateRuleMatch(e: Event, index: number) {
    const inputElement = e.target as HTMLInputElement;
    let value = inputElement.value;

    // Remove any non-numeric characters (this makes sure input is strictly numeric)
    value = value.replace(/[^0-9]/g, "");

    // Convert the value to a number and clamp it to the range 0-100
    let numericValue = Number(value);

    if (numericValue < 0) numericValue = 0;
    if (numericValue > 100) numericValue = 100;

    // Update the input value with the clamped number
    inputElement.value = numericValue.toString();

    // Update the rule match
    this._updateRuleMatch(index, inputElement.value);
  }

  /*


  */
  private _updateRuleTarget(index: number, value: string) {
    this.branchContainer.rules[index].target = value;
    this.branchContainer.rules = [...this.branchContainer.rules];
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
