import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

import { WebWriterConnectionButton } from "./webwriter-connection-button";

//Shoelace
import { SlButton } from "@shoelace-style/shoelace";

import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../gamebook-editor-state-lit-context";

@customElement("webwriter-gamebook-branch-container")
export class WebWriterGamebookBranchContainer extends LitElementWw {
  //associated node id
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId;

  @property({ type: Number, attribute: true, reflect: true })
  accessor incomingContainerId = -1;

  // Array of custom objects (rules)
  @property({ type: Array, attribute: true, reflect: true })
  accessor rules: Rule[] = [];

  // Array of custom objects (rules)
  @property({ type: Object, attribute: true, reflect: true })
  accessor elseRule: Rule;

  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle;

  //import CSS
  static get styles() {
    return css``;
  }

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "webwriter-connection-button": WebWriterConnectionButton,
    };
  }

  /* 
  
  
  */
  constructor() {
    super();
  }

  /*


  */
  render() {
    return html`<slot></slot>`;
  }

  /*


  */
  public hide() {
    this.style.display = "none";
  }

  /*


  */
  public show() {
    this.style.display = "block";
  }

  /*

  Clears all rules from the rules array
  */
  public clearRules() {
    this.rules.forEach((rule) => {
      this.deleteRule((rule as Rule).output_id);
    });

    this.rules = [];
  }

  /*

  Adds a new rule to the rules array
  */
  private addRule(newRule: Rule) {
    // Add the new rule to the rules array
    this.rules = [...this.rules, newRule];
  }

  /*


  */
  public addEmptyRule(node) {
    // Step 3: Get the last created output's output_class

    const outputKeys = Object.keys(node.outputs);

    const lastOutputClass = outputKeys[outputKeys.length - 1];

    const emptyRule: Rule = {
      output_id: lastOutputClass,
      elementId: "",
      quizTasks: "",
      condition: "",
      match: "",
      target: "",
      isConditionEnabled: false,
      isMatchEnabled: false,
      isTargetEnabled: false,
    };
    this.addRule(emptyRule);

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /*

  Deletes a rule from the rules array by its ID
  */
  public deleteRule(output_id: string) {
    this.dispatchEvent(
      new CustomEvent("deleteOutput", {
        detail: {
          nodeId: this.drawflowNodeId,
          outputClass: output_id,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Filter out the rule with the specified id
    this.rules = this.rules.filter((rule) => rule.output_id !== output_id);
    this.rules = [...this.rules];

    this.updateAllRulesOutputIds(output_id);

    //Step 5: If its the last rule, delete it
    const noOfExistingRules = this.rules.length;
    if (noOfExistingRules == 0 && this.elseRule !== undefined) {
      this.removeElseRule();
    }

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /*


  */
  public updateAllRulesOutputIds(deleted_output_id: string) {
    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      deleted_output_id.split("_")[1],
      10
    );

    //
    this.rules.forEach((rule, index) => {
      const outputIdNumber = parseInt(rule.output_id.split("_")[1], 10);
      // Check if the linkButton should be updated
      if (outputIdNumber > removedOutputClassNumber) {
        // Generate the new identifier with incremented output_class
        this.rules[index].output_id = `output_${outputIdNumber - 1}`;
        this.rules = [...this.rules];
      }
    });

    // Update this.elseRule
    const elseRuleOutputIdNumber = parseInt(
      this.elseRule?.output_id.split("_")[1],
      10
    );
    if (elseRuleOutputIdNumber > removedOutputClassNumber) {
      this.elseRule = {
        ...this.elseRule,
        output_id: `output_${elseRuleOutputIdNumber - 1}`,
      };
    }
  }

  /*

  
  */
  public updateRuleOutputId(index, new_output_id) {
    this.rules[index] = { ...this.rules[index], output_id: new_output_id }; // Update target to input_id
    this.rules = [...this.rules];
  }

  /*

  
  */

  public updateRules(rules) {
    this.rules = [...rules];
  }
  /*

  
  */
  public addEmptyElseRule(node) {
    // Step 4: Extract the last created output's output_class
    const outputKeys = Object.keys(node.outputs);
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
    this.elseRule = { ...elseRule };

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /*

  
  */
  public removeElseRule() {
    this.dispatchEvent(
      new CustomEvent("deleteOutput", {
        detail: {
          nodeId: this.drawflowNodeId,
          outputClass: this.elseRule.output_id,
        },
        bubbles: true,
        composed: true,
      })
    );

    this.elseRule = undefined;
  }

  /*


  */
  public _moveElseRuleToLastOutput(node) {
    const { outputs } = node;

    const highestOutputIdIndex = this.rules.reduce(
      (maxIndex, rule, currentIndex) => {
        const maxNumber = parseInt(
          this.rules[maxIndex].output_id.split("_")[1],
          10
        );
        const currentNumber = parseInt(rule.output_id.split("_")[1], 10);
        return currentNumber > maxNumber ? currentIndex : maxIndex;
      },
      0
    );

    // Swap the output_id between the highest rule and the elseRule.
    const elseRuleOutputId = this.elseRule.output_id;
    const newRuleOutputId = this.rules[highestOutputIdIndex].output_id;

    this.rules[highestOutputIdIndex].output_id = elseRuleOutputId;
    this.rules = [...this.rules];
    this.elseRule.output_id = newRuleOutputId;

    // Update the connections to reflect the changes.
    outputs[elseRuleOutputId].connections.forEach((connection) => {
      // Create a new connection for the swapped rule.
      this.dispatchEvent(
        new CustomEvent("createConnection", {
          detail: {
            outputNodeId: node.id,
            inputNodeId: connection.node,
            outputClass: newRuleOutputId,
            inputClass: "input_1",
          },
          bubbles: true,
          composed: true,
        })
      );

      // Remove the old connection from the elseRule.
      this.dispatchEvent(
        new CustomEvent("deleteConnection", {
          detail: {
            outputNodeId: node.id,
            inputNodeId: connection.node,
            outputClass: elseRuleOutputId,
            inputClass: "input_1",
          },
          bubbles: true,
          composed: true,
        })
      );
    });

    this.elseRule = {
      ...this.elseRule,
      output_id: newRuleOutputId,
    };

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /*


  */
  public _updateRuleElement(
    index: number,
    value: string,
    container: HTMLElement
  ) {
    this.rules[index].elementId = value;

    if (value == "") {
      this.rules[index].isConditionEnabled = false;

      this._updateRuleTasks(index, "", container);
      this._updateRuleCondition(index, "", container);
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(this.rules[index].output_id, "");
    }
    //
    else if (
      container?.querySelector(`#${value}`)?.tagName?.toLowerCase() ==
      "webwriter-quiz"
    ) {
      this.rules[index].isConditionEnabled = false;
    }
    //
    else {
      this.rules[index].isConditionEnabled = true;
    }

    this.rules = [...this.rules];
  }

  /*


  */
  public removeElementOfRules(element_id: string, isQuiz: boolean): string[][] {
    const resetRule = (rule) => ({
      ...rule,
      elementId: "",
      quizTasks: "",
      condition: "",
      match: "",
      target: "",
      isConditionEnabled: false,
      isMatchEnabled: false,
      isTargetEnabled: false,
    });

    let removeConnectionsFromOutputs = [];

    for (let rule of this.rules) {
      if (rule.elementId === element_id) {
        if (rule.target !== "") {
          removeConnectionsFromOutputs.push([rule.output_id, rule.target]);
        }
        rule = resetRule(rule);
        this.rules = this.rules.filter(
          (rule) => rule.output_id !== rule.output_id
        );
        this.addRule(rule);
      }
      //
      else if (!isQuiz && rule.quizTasks.includes(element_id)) {
        const updatedQuizTaskSelection = rule.quizTasks.replace(element_id, "");
        if (rule.target !== "") {
          removeConnectionsFromOutputs.push([rule.output_id, rule.target]);
        }

        if (!/\S/.test(updatedQuizTaskSelection)) {
          rule = {
            ...rule,
            quizTasks: "",
            condition: "",
            match: "",
            target: "",
            isConditionEnabled: false,
            isMatchEnabled: false,
            isTargetEnabled: false,
          };
        } else {
          rule = {
            ...rule,
            quizTasks: updatedQuizTaskSelection,
            condition: "",
            match: "",
            target: "",
            isConditionEnabled: true,
            isMatchEnabled: false,
            isTargetEnabled: false,
          };
        }

        this.rules = this.rules.filter(
          (rule) => rule.output_id !== rule.output_id
        );
        this.addRule(rule);
      }
    }

    //reference update to trigger re-render
    this.rules = [...this.rules];

    this.requestUpdate();
    return removeConnectionsFromOutputs;
  }

  /*


  */
  public _updateRuleTasks(index: number, value: string, container) {
    this.rules[index].isConditionEnabled = value !== "";

    if (value === "") {
      this._updateRuleCondition(index, "", container);
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(this.rules[index].output_id, "");
    }
    this.rules[index].quizTasks = value.replace(/,/g, " ");
    this.rules = [...this.rules];
  }

  /*


  */
  public _updateRuleTarget(output_class, input_id) {
    // Helper function to find and update the rule in an array of rules
    this.rules.forEach((rule, index) => {
      if (rule.output_id === output_class) {
        if (input_id === "") {
          this.dispatchEvent(
            new CustomEvent("deleteConnection", {
              detail: {
                outputNodeId: this.drawflowNodeId,
                inputNodeId: rule.target,
                outputClass: rule.output_id,
                inputClass: "input_1",
              },
              bubbles: true,
              composed: true,
            })
          );
        }

        this.rules[index] = { ...rule, target: input_id }; // Update target to input_id
        this.rules = [...this.rules];
      }
    });

    // If this.elseRule is an object, check and update it directly
    if (this.elseRule && this.elseRule.output_id === output_class) {
      if (input_id == "") {
        this.dispatchEvent(
          new CustomEvent("deleteConnection", {
            detail: {
              outputNodeId: this.drawflowNodeId,
              inputNodeId: this.elseRule.target,
              outputClass: this.elseRule.output_id,
              inputClass: "input_1",
            },
            bubbles: true,
            composed: true,
          })
        );
      }
      this.elseRule = {
        ...this.elseRule,
        target: input_id,
      };
    }
  }

  /*


  */
  public _updateRuleCondition(
    index: number,
    value: string,
    container: HTMLElement
  ) {
    this.rules[index].condition = value;

    if (value == "") {
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(this.rules[index].output_id, "");
      this.rules[index].isMatchEnabled = false;
      this.rules[index].isTargetEnabled = false;
    }
    //
    else if (
      container
        .querySelector(`#${this.rules[index].elementId}`)
        ?.tagName?.toLowerCase() == "webwriter-quiz"
    ) {
      this.rules[index].isMatchEnabled = true;
    }
    //
    else {
      this.rules[index].isTargetEnabled = true;
      this.dispatchEvent(
        new CustomEvent("markOutputs", {
          bubbles: true,
          composed: true,
        })
      );
    }

    this.rules = [...this.rules];
  }

  /*


  */
  public _updateRuleMatch(index: number, value: string) {
    this.rules[index].match = value;
    this.rules[index].isTargetEnabled = value !== "";

    if (value === "") {
      this._updateRuleTarget(this.rules[index].output_id, "");
    }

    this.rules = [...this.rules];

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }
}
