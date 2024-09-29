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

@customElement("webwriter-gamebook-branch-container")
export class WebWriterGamebookBranchContainer extends LitElementWw {
  //associated node id
  @property({ type: Number, attribute: true, reflect: true })
  accessor drawflowNodeId;

  @property({ type: String, attribute: true, reflect: true })
  accessor incomingContainerDrawflowNodeId;

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
  protected firstUpdated(_changedProperties: PropertyValues): void {
    // You can handle any initialization related to rules here
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

  Adds a new rule to the rules array
  */
  public addRule(newRule: Rule) {
    // Add the new rule to the rules array
    this.rules = [...this.rules, newRule];
  }

  /*

  Deletes a rule from the rules array by its ID
  */
  public deleteRule(output_id: string) {
    // Filter out the rule with the specified id
    this.rules = this.rules.filter((rule) => rule.output_id !== output_id);

    this.updateRulesOutputIds(output_id);
  }

  /*


  */
  public updateRulesOutputIds(deleted_output_id: string) {
    // Extract the number from the output_class parameter
    const removedOutputClassNumber = parseInt(
      deleted_output_id.split("_")[1],
      10
    );

    //
    this.rules.forEach((rule) => {
      const outputIdNumber = parseInt(rule.output_id.split("_")[1], 10);
      // Check if the linkButton should be updated
      if (outputIdNumber > removedOutputClassNumber) {
        // Generate the new identifier with incremented output_class
        rule.output_id = `output_${outputIdNumber - 1}`;
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

  Clears all rules from the rules array
  */
  public clearRules() {
    // Clear the rules array
    this.rules = [];

    // Optionally, you can log or perform other actions
    //console.log("All rules cleared");
  }

  /*

  
  */
  public addElseRule(elseRule: Rule) {
    // Add the new rule to the rules array
    this.elseRule = elseRule;
  }

  /*

  
  */
  public removeElseRule() {
    this.elseRule = undefined;
  }

  /*

  */
  public updateRuleTarget(output_class, input_id) {
    // Helper function to find and update the rule in an array of rules
    const updateTargetInArray = (ruleSet) => {
      for (let rule of ruleSet) {
        if (rule.output_id === output_class) {
          //console.log("rule", output_class, "target is updated to", input_id);
          rule = { ...rule, target: input_id }; // Update target to input_id
          return; // Exit once the rule is found and updated
        }
      }
    };

    // Update target in this.rules if a matching rule is found
    if (Array.isArray(this.rules)) {
      updateTargetInArray(this.rules);
    }

    // If this.elseRule is an object, check and update it directly
    if (this.elseRule && this.elseRule.output_id === output_class) {
      //console.log("elseRule is updated to", output_class);
      this.elseRule = {
        ...this.elseRule,
        target: input_id,
      };
    }
  }
}
