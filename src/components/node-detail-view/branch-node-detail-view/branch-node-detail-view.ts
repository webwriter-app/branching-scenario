import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";

import { repeat } from "lit/directives/repeat.js";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";

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
import styles from "./branch-node-detail-view.styles";

//Tabler
import plus from "@tabler/icons/outline/plus.svg";
import minus from "@tabler/icons/outline/minus.svg";

import circleDashedX from "@tabler/icons/outline/circle-dashed-x.svg";
import circleDashedCheck from "@tabler/icons/outline/circle-dashed-check.svg";

import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import gripHorizontal from "@tabler/icons/outline/grip-horizontal.svg";
import percentage from "@tabler/icons/outline/percentage.svg";
import { NodeOutputSelect } from "../../node-output-select/node-output-select";
import { WebWriterQuizSelect } from "../../component-select/webwriter-quiz-select/webwriter-quiz-select";
import { WebWriterQuizTasksSelect } from "../../component-select/webwriter-quiz-tasks-select/webwriter-quiz-tasks-select";

import { ToggleTextInput } from "../../toggle-text-input/toggle-text-input";
import { NodeConnectionList } from "../../node-connection-list/node-connection-list";

import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../../utils/gamebook-editor-state-context";

@customElement("branch-node-detail-view")
export class BranchNodeDetailView extends LitElementWw {
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

      "node-output-select": NodeOutputSelect,
      "webwriter-quiz-select": WebWriterQuizSelect,
      "toggle-text-input": ToggleTextInput,
      "node-connection-list": NodeConnectionList,
      "webwriter-quiz-tasks-select": WebWriterQuizTasksSelect,
    };
  }

  //import CSS
  static styles = [styles];

  //public properties are part of the component's public API

  @property({ type: Boolean }) accessor ruleDrag = false;
  private draggedIndex = -1;
  @property({ type: Number }) accessor hoveredDividerIndex = -1;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  //

  //
  protected firstUpdated(_changedProperties: PropertyValues): void {}

  render() {
    let isConnected =
      this.editorStore.selectedContainer?.incomingContainerId !== -1;
    return html`
      <div class="title-bar">
        <div class="div-icon-branch">
          <sl-icon src=${arrowsSplit2}></sl-icon>
        </div>
        <div class="div-title">
          <toggle-text-input
            .text=${this.editorStore.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggle-text-input>
          <p class="subtitle">Branch</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list
            branch
            .selectedNode=${this.editorStore.selectedNode}
          ></node-connection-list>
        </div>
      </div>
      ${this.editorStore.selectedContainer
        ? html`<div class="container">
            <div class="titlebar">
              <p
                class="title"
                style=${isConnected ? "color: #505055" : "color: darkgrey"}
              >
                Rules
                (${this.editorStore.selectedContainer.rules?.length.toString()})
              </p>
              <sl-icon-button
                src=${plus}
                class="add"
                @click=${() => this.addEmptyRule()}
                ?disabled=${!isConnected}
              >
              </sl-icon-button>
            </div>

            <div class="ruleList">
              ${this.editorStore.selectedContainer?.rules?.length > 0
                ? html`
                    ${repeat(
                      this.editorStore.selectedContainer?.rules as Rule[],
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
                                 ${parseInt(
                                   (rule as any).output_id.split("_")[1],
                                   10
                                 )}
                               </p>
                             </div>

                             <sl-icon
                               class="draggable"
                               src=${gripHorizontal}
                               style="font-size: 15px; flex-shrink: 0"
                             ></sl-icon>

                             <!-- Element -->
                             <webwriter-quiz-select
                               .value=${(rule as any).elementId}
                               @sl-change=${(e: Event) =>
                                 this.updateRuleElement(
                                   index,
                                   (
                                     e.target as WebWriterQuizSelect
                                   ).selectElement.value.toString()
                                 )}
                               .container=${
                                 this.editorStore.branchIncomingContainer
                               }
                             >
                             </webwriter-quiz-select>

                             <!-- Subelements -->
                             ${
                               (rule as any).elementId !== "" &&
                               rule.elementId !== "text" &&
                               this.editorStore.branchIncomingContainer
                                 .querySelector(`#${rule.elementId}`)
                                 ?.tagName.toLowerCase() == "webwriter-quiz"
                                 ? html` <webwriter-quiz-tasks-select
                                     .value=${rule.quizTasks.split(" ")}
                                     @sl-change=${(e: Event) =>
                                       this.updateRuleTasks(
                                         index,
                                         (
                                           e.target as WebWriterQuizSelect
                                         ).selectElement.value.toString()
                                       )}
                                     .quiz=${this.editorStore.branchIncomingContainer.querySelector(
                                       `#${rule.elementId}`
                                     )}
                                   >
                                   </webwriter-quiz-tasks-select>`
                                 : null
                             }

                             <!-- Condition -->
                             <sl-select
                               clearable
                               placeholder="Condition"
                               value=${rule.condition}
                               @sl-change=${(e: Event) =>
                                 this.updateRuleCondition(
                                   index,
                                   (e.target as HTMLSelectElement).value
                                 )}
                               ?disabled=${!rule.isConditionEnabled}
                             >
                               <!-- Quiz Conditions -->
                               <sl-option value="correct">
                                 <sl-icon
                                   slot="prefix"
                                   src=${circleDashedCheck}
                                 ></sl-icon>
                                 Correct</sl-option
                               >
                               <sl-option value="incorrect">
                                 <sl-icon
                                   slot="prefix"
                                   src=${circleDashedX}
                                 ></sl-icon>
                                 Incorrect</sl-option
                               >
                             </sl-select>

                             <!-- Match -->
                             ${
                               rule.elementId !== ""
                                 ? html`${this.editorStore.branchIncomingContainer
                                     .querySelector(`#${rule.elementId}`)
                                     ?.tagName?.toLowerCase() ===
                                     "webwriter-quiz" && rule.condition == ""
                                     ? html`
                                         <sl-input
                                           placeholder="Match"
                                           ?disabled=${!rule.isMatchEnabled}
                                         ></sl-input>
                                       `
                                     : this.editorStore.branchIncomingContainer
                                         .querySelector(`#${rule.elementId}`)
                                         ?.tagName.toLowerCase() ==
                                         "webwriter-quiz" &&
                                       (rule.condition == "correct" ||
                                         rule.condition == "incorrect")
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
                                 : null
                             }

                             <!-- Output -->
                             <node-output-select
                              
                               .selectedNode=${this.editorStore.selectedNode}
                               .incomingNodeId=${
                                 this.editorStore.selectedNode.inputs["input_1"]
                                   .connections?.[0]?.node
                               }
                               .outputClass=${rule.output_id}
                               ?disabled=${!rule.isTargetEnabled}
                               required="true"
                             ></node-output-select>

                             <sl-icon-button
                               class="minus"
                               src=${minus}
                               style="font-size: 15px;"
                               @click=${() =>
                                 this.editorStore.selectedContainer.deleteRule(
                                   rule.output_id
                                 )}
                               ?disabled=${!this.isConnected}
                             ></sl-icon-button>
                           </div>
                 
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

                      <!-- Output -->
                      <node-output-select
                        .selectedNode=${this.editorStore.selectedNode}
                        .incomingNodeId=${this.editorStore.selectedNode.inputs[
                          "input_1"
                        ].connections?.[0]?.node}
                        .outputClass=${this.editorStore.selectedContainer
                          .elseRule?.output_id}
                        required="true"
                      ></node-output-select>
                    </div>
                  `
                : html`<p class="no-node">No branching rules</p>`}
            </div>
            <slot></slot>
          </div>`
        : null}
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

    if (
      this.draggedIndex !== -1 &&
      this.hoveredDividerIndex !== -1 &&
      this.draggedIndex !== this.hoveredDividerIndex
    ) {
      const { selectedContainer, selectedNode } = this.editorStore;

      let staticCopyRules = this.editorStore.selectedContainer.rules;

      const hoveredRuleOutput =
        selectedContainer.rules[this.hoveredDividerIndex].output_id;

      const draggedRuleOutput =
        selectedContainer.rules[this.draggedIndex].output_id;

      const outputs = selectedNode.outputs;

      outputs[draggedRuleOutput].connections.forEach((connection) => {
        const connectionDetail = {
          outputNodeId: selectedNode.id,
          inputNodeId: connection.node,
          inputClass: "input_1",
        };

        this.dispatchEvent(
          new CustomEvent("createConnection", {
            detail: { ...connectionDetail, outputClass: hoveredRuleOutput },
            bubbles: true,
            composed: true,
          })
        );
        this.dispatchEvent(
          new CustomEvent("deleteConnection", {
            detail: { ...connectionDetail, outputClass: draggedRuleOutput },
            bubbles: true,
            composed: true,
          })
        );
      });

      // Extract output numbers
      const hoveredOutputNumber = parseInt(hoveredRuleOutput.split("_")[1], 10);
      const draggedOutputNumber = parseInt(draggedRuleOutput.split("_")[1], 10);

      // Calculate range and movement direction
      const [minOutputNumber, maxOutputNumber] = [
        Math.min(hoveredOutputNumber, draggedOutputNumber),
        Math.max(hoveredOutputNumber, draggedOutputNumber),
      ];
      const adjustment = hoveredOutputNumber < draggedOutputNumber ? 1 : -1;

      // Iterate through outputs and adjust connections
      Object.keys(outputs).forEach((outputClass, index) => {
        const outputIdNumber = parseInt(outputClass.split("_")[1], 10);

        // Check if the output is between the hovered and dragged, excluding the dragged one
        if (
          outputIdNumber >= minOutputNumber &&
          outputIdNumber <= maxOutputNumber &&
          outputIdNumber !== draggedOutputNumber
        ) {
          const newOutputClass = `output_${outputIdNumber + adjustment}`;

          outputs[outputClass].connections?.forEach((connection) => {
            const connectionDetail = {
              outputNodeId: selectedNode.id,
              inputNodeId: connection.node,
              inputClass: "input_1",
            };

            this.dispatchEvent(
              new CustomEvent("createConnection", {
                detail: { ...connectionDetail, outputClass: newOutputClass },
                bubbles: true,
                composed: true,
              })
            );
            this.dispatchEvent(
              new CustomEvent("deleteConnection", {
                detail: { ...connectionDetail, outputClass: outputClass },
                bubbles: true,
                composed: true,
              })
            );
          });

          staticCopyRules[index].output_id = newOutputClass;
        }
      });

      staticCopyRules[this.draggedIndex].output_id = hoveredRuleOutput;

      //Update the rules index in the rules array according to drag by removing the rule and adding it at the drop position
      let [draggedRule] = staticCopyRules.splice(this.draggedIndex, 1);

      staticCopyRules.splice(this.hoveredDividerIndex, 0, draggedRule);

      this.editorStore.selectedContainer.updateRules(staticCopyRules);
    }

    this._onDragEnd();

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );

    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);

    this.requestUpdate();
  }

  /*


  */
  private _validateAndUpdateRuleMatch(e: Event, index: number) {
    const inputElement = e.target as SlInput;

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
    this.editorStore.selectedContainer._updateRuleMatch(
      index,
      inputElement.value
    );

    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);

    this.requestUpdate();
  }

  /*


  */
  private addEmptyRule() {
    // Step 1
    this.dispatchEvent(
      new CustomEvent("addOutput", {
        detail: {
          nodeId: this.editorStore.selectedNode.id,
        },
        bubbles: true,
        composed: true,
      })
    );

    this.editorStore.selectedContainer.addEmptyRule(
      this.editorStore.selectedNode
    );

    // Step 5: Ensure the else rule is handled properly
    if (this.editorStore.selectedContainer.elseRule) {
      this.editorStore.selectedContainer._moveElseRuleToLastOutput(
        this.editorStore.selectedNode
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("addOutput", {
          detail: {
            nodeId: this.editorStore.selectedNode.id,
          },
          bubbles: true,
          composed: true,
        })
      );

      this.editorStore.selectedContainer.addEmptyElseRule(
        this.editorStore.selectedNode
      );
    }

    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);
    this.requestUpdate();
  }
  /*


  */
  private updateRuleElement(index, value) {
    this.editorStore.selectedContainer._updateRuleElement(
      index,
      value,
      this.editorStore.branchIncomingContainer
    );

    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);

    this.requestUpdate();
  }

  /* 
  
  */
  private updateRuleTasks(index, value) {
    this.editorStore.selectedContainer._updateRuleTasks(
      index,
      value,
      this.editorStore.branchIncomingContainer
    );

    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);

    this.requestUpdate();
  }

  /* 
  
  */
  private updateRuleCondition(index, value) {
    this.editorStore.selectedContainer._updateRuleCondition(
      index,
      value,
      this.editorStore.branchIncomingContainer
    );

    this.editorStore.setSelectedContainer(this.editorStore.selectedContainer);

    this.requestUpdate();
  }

  /*

*/

  /*


  */
  private renameNode(text: String) {
    const event = new CustomEvent("renameSelectedNode", {
      detail: { newTitle: text },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
