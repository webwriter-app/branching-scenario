import { GamebookContainer } from "../components/gamebook-container";
import { dataBlockSelector, DataBlockObserver, parseData, writeData } from "../components/data-block";
import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { DiagramNode } from "../model/diagram";
import { emptyRule, outputNumber, type Rule } from "../model/branching-rule";

/**
 * Represents the logic of a branch of a gamebook.
 */
@customElement("webwriter-gamebook-branch")
export class WebwriterGamebookBranch extends GamebookContainer {
  /** Associated node id */
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId: number;

  /** Associated incoming container id */
  @property({ type: Number, attribute: true, reflect: true })
  accessor incomingContainerId = -1;

  /** Array of custom objects (rules) */
  @property({ attribute: false })
  accessor rules: Rule[] = [];

  /** The else rule (custom object) */
  @property({ attribute: false })
  accessor elseRule: Rule | undefined;

  /** The title of the page */
  @property({ type: String, attribute: true, reflect: true })
  accessor pageTitle: string;

  private ruleDataText: string | null = null;
  private rulesObserver = new DataBlockObserver(this, () => this.restoreRules());
  private mutationObserver: MutationObserver;

  private get ruleText() {
    return this.querySelector(dataBlockSelector)?.textContent ?? null;
  }

  private restoreRules() {
    const text = this.ruleText;
    if (text === this.ruleDataText) return;
    this.ruleDataText = text;
    const data = parseData<{rules: Rule[]; elseRule: Rule}>(text);
    this.rules = Array.isArray(data.rules) ? data.rules : [];
    this.elseRule = data.elseRule;
  }

  constructor() {
    super();
    this.mutationObserver = new MutationObserver(this.mutationCallback);
  }

  connectedCallback() {
    super.connectedCallback();
    this.restoreRules();
    this.mutationObserver.observe(this, { attributes: true, attributeFilter: ["class"] });
    this.rulesObserver.connect();
  }

  disconnectedCallback() {
    this.rulesObserver.disconnect();
    this.mutationObserver.disconnect();
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has("rules") && !changed.has("elseRule")) return;
    if (this.ruleDataText !== this.ruleText) {
      this.restoreRules();
      return;
    }
    const data = parseData<{rules: Rule[]; elseRule: Rule}>(this.ruleDataText);
    const state = {rules: this.rules, elseRule: this.elseRule};
    if (JSON.stringify(state) === JSON.stringify({rules: data.rules ?? [], elseRule: data.elseRule})) return;
    writeData(this, state);
    this.ruleDataText = this.ruleText;
  }

  render() {
    return html`<slot></slot>`;
  }

  /**
   * Clears all rules from the rules array
   */
  public clearRules() {
    this.rules.forEach((rule) => {
      this.deleteRule(rule.output_id);
    });

    this.rules = [];
  }

  /** 
   * Adds a new rule to the rules array
   * 
   * @param newRule The rule object to be added
   */
  private addRule(newRule: Rule) {
    // Add the new rule to the rules array
    this.rules = [...this.rules, newRule];
  }

  /**
   * Adds an empty rule to the rules array
   * 
   * @param node The node to which the rule will be associated
   */
  public addEmptyRule(node: DiagramNode) {

    const outputKeys = Object.keys(node.outputs);

    const lastOutputClass = outputKeys[outputKeys.length - 1];

    this.addRule(emptyRule(lastOutputClass));

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Deletes a rule from the rules array by its ID
   * 
   * @param output_id The ID of the rule to be deleted
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

  /**
   * Update all rules output IDs after deletion of an output
   * 
   * @param deleted_output_id The ID of the deleted output
   */
  public updateAllRulesOutputIds(deleted_output_id: string) {
    // Extract the number from the output_class parameter
    const removedOutputClassNumber = outputNumber(deleted_output_id);

    this.rules.forEach((rule, index) => {
      const outputIdNumber = outputNumber(rule.output_id);
      // Check if the linkButton should be updated
      if (outputIdNumber > removedOutputClassNumber) {
        // Generate the new identifier with incremented output_class
        this.rules[index].output_id = `output_${outputIdNumber - 1}`;
        this.rules = [...this.rules];
      }
    });

    // Update this.elseRule
    if (this.elseRule) {
      const elseRuleOutputIdNumber = outputNumber(this.elseRule.output_id);
      if (elseRuleOutputIdNumber > removedOutputClassNumber) {
        this.elseRule = {
          ...this.elseRule,
          output_id: `output_${elseRuleOutputIdNumber - 1}`,
        };
      }
    }
  }

  /**
   * Updates a rule's output ID by its index
   * 
   * @param index The index of the rule to be updated
   * @param new_output_id The new output ID to be set
   */
  public updateRuleOutputId(index: number, new_output_id: string) {
    this.rules[index] = { ...this.rules[index], output_id: new_output_id }; // Update target to input_id
    this.rules = [...this.rules];
  }

  /**
   * Updates the entire rules array (deep clone)
   * 
   * @param rules The new array of rules to be set
   */
  public updateRules(rules: Rule[]) {
    this.rules = [...rules];
  }

  /**
   * Adds an empty else rule to the rules array
   * 
   * @param node The node to which the rule will be associated
   */
  public addEmptyElseRule(node: DiagramNode) {
    const outputKeys = Object.keys(node.outputs);
    const lastOutputClass = outputKeys[outputKeys.length - 1]; // Get the last key (latest output)

    this.elseRule = emptyRule(lastOutputClass);

    this.dispatchEvent(
      new CustomEvent("markOutputs", {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Removes the else rule
   */
  public removeElseRule() {
    if (!this.elseRule) return;
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

  /**
   * Moves the else rule to be the last output
   * 
   * @param node The node to which the rule will be associated
   */
  public _moveElseRuleToLastOutput(node: DiagramNode) {
    const { outputs } = node;
    if (!this.elseRule) return;

    const highestOutputIdIndex = this.rules.reduce(
      (maxIndex, rule, currentIndex) => {
        const maxNumber = outputNumber(this.rules[maxIndex].output_id);
        const currentNumber = outputNumber(rule.output_id);
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

  /**
   * Updates a rule's element ID by its index
   * 
   * @param index The index of the rule to be updated
   * @param value The new element ID to be set
   * @param container The container HTMLElement
   */
  public _updateRuleElement(
    index: number,
    value: string,
    container: HTMLElement | undefined
  ) {
    this.rules[index].elementId = value;

    if (value == "") {
      this.rules[index].isConditionEnabled = false;

      this._updateRuleTasks(index, "", container);
      this._updateRuleCondition(index, "", container);
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(this.rules[index].output_id, "");
    }
    else if (
      container?.querySelector(`#${value}`)?.tagName?.toLowerCase() ==
      "webwriter-quiz"
    ) {
      this.rules[index].isConditionEnabled = false;
    }
    else {
      this.rules[index].isConditionEnabled = true;
    }

    this.rules = [...this.rules];
  }

  /**
   * Removes references to a deleted element from all rules
   * 
   * @param element_id The ID of the deleted element
   * @param isQuiz Whether the deleted element is a quiz
   * @returns An array of connections to be removed
   */
  public removeElementOfRules(element_id: string, isQuiz: boolean): Array<[string, string | number]> {
    const resetRule = (rule: Rule): Rule => ({
      ...emptyRule(rule.output_id),
    });

    const removeConnectionsFromOutputs: Array<[string, string | number]> = [];

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

  /**
   * Updates the quiz tasks for a rule
   * 
   * @param index The index of the rule to be updated
   * @param value The new quiz tasks value (comma-separated string)
   * @param container The container HTMLElement
   */
  public _updateRuleTasks(index: number, value: string, container: HTMLElement | undefined) {
    this.rules[index].isConditionEnabled = value !== "";

    if (value === "") {
      this._updateRuleCondition(index, "", container);
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(this.rules[index].output_id, "");
    }
    this.rules[index].quizTasks = value.replace(/,/g, " ");
    this.rules = [...this.rules];
  }

  /**
   * Updates the target of a rule by output class
   * 
   * @param output_class The output ID to match against rules
   * @param input_id The new target input ID
   */
  public _updateRuleTarget(output_class: string, input_id: string | number) {
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

  /**
   * Updates the condition for a rule
   * 
   * @param index The index of the rule to be updated
   * @param value The new condition value
   * @param container The container HTMLElement
   */
  public _updateRuleCondition(
    index: number,
    value: string,
    container: HTMLElement | undefined
  ) {
    this.rules[index].condition = value;

    if (value == "") {
      this._updateRuleMatch(index, "");
      this._updateRuleTarget(this.rules[index].output_id, "");
      this.rules[index].isMatchEnabled = false;
      this.rules[index].isTargetEnabled = false;
    }
    else if (
      container
        ?.querySelector(`#${this.rules[index].elementId}`)
        ?.tagName?.toLowerCase() == "webwriter-quiz"
    ) {
      this.rules[index].isMatchEnabled = true;
    }
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

  /**
   * Updates the match value for a rule
   * 
   * @param index The index of the rule to be updated
   * @param value The new match value
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

  private mutationCallback = (mutationList: MutationRecord[]) => {
    if (!this.authoring) return;
    mutationList.forEach(
      ({ type, attributeName }) => {
        if (type === "attributes" && attributeName === "class") {
          if (this.classList.contains("ProseMirror-selectednode")) {
            const event = new CustomEvent("nodeWwSelected", {
              detail: { nodeId: this.drawflowNodeId },
              bubbles: true,
              composed: true,
            });
            this.dispatchEvent(event);
          }
        }
      }
    );
  };
}
