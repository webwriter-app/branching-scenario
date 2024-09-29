import { html, css, LitElement, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlSelect,
  SlOption,
  SlDivider,
  SlIcon,
  SlInput,
} from "@shoelace-style/shoelace";
import Drawflow, { DrawflowNode } from "drawflow";

import number123 from "@tabler/icons/outline/number-123.svg";
import checkbox from "@tabler/icons/outline/checkbox.svg";
import blockquote from "@tabler/icons/outline/blockquote.svg";
import highlight from "@tabler/icons/outline/highlight.svg";
import microphone from "@tabler/icons/outline/microphone.svg";

const NO_NODE_SELECTED: DrawflowNode = {
  id: -1,
  name: "unselect",
  inputs: {},
  outputs: {},
  pos_x: 0,
  pos_y: 0,
  class: "unselect",
  data: {},
  html: "",
  typenode: false,
};

@customElement("quiz-tasks-select")
export class QuizTasksSelect extends LitElement {
  @property({ type: Object }) accessor quiz;
  @property({ type: Object }) accessor options = [];
  @property({ type: String }) accessor value;

  @state() accessor searchTerm = "";

  @query("sl-input") accessor searchElement!: SlInput;
  @query("sl-select") accessor selectElement!: SlSelect;

  static styles = css`
    .nodeSelect {
      width: 100%;
    }

    sl-select::part(listbox) {
      width: 250px;
      height: 250px;
    }

    sl-select::part(tags) {
      width: 80px;
    }

    sl-select::part(tag) {
      max-width: 40%; /* Adjust the width to your needs */

      white-space: nowrap; /* Ensure text is in one line */
      overflow: hidden; /* Hide overflowing text */
      text-overflow: ellipsis; /* Add "..." if text overflows */
    }

    sl-select.two-tags::part(tag) {
      display: inline-flex; /* Keep the layout as inline flex */

      max-width: 30px; /* Control the minimum width */

      white-space: nowrap; /* Ensure the text stays in one line */
      overflow: hidden; /* Hide overflowing content */
      text-overflow: ellipsis; /* Add ellipsis for truncated content */
      box-sizing: border-box; /* Include padding/border in width calculation */
    }

    .node-option-visible {
      display: block;
    }
    .node-option-hidden {
      display: none;
    }
  `;

  /*

  */
  // Move the option gathering logic to firstUpdated lifecycle method
  firstUpdated() {
    const containersSlot = this.quiz?.shadowRoot.querySelector("slot");
    const assignedElements = containersSlot.assignedElements();

    // Filter nodes with class "ww-widget" and add them to this.options
    const tasks = assignedElements.filter((el) =>
      el.tagName.toLowerCase().includes("webwriter-task")
    );

    let taskOptions = [];

    tasks.forEach((task) => {
      const taskContent = task.children;

      const prompt = taskContent[0];
      const taskElement = taskContent[1];

      //TODO: Add Support for Speech Quiz Task
      if (!taskElement.tagName.toLowerCase().includes("speech")) {
        taskOptions = [
          ...taskOptions,
          { task: task, prompt: prompt, taskElement: taskElement },
        ];
      }
    });

    this.options = [...this.options, ...taskOptions];
  }

  protected updated(_changedProperties: PropertyValues): void {
    const partTags =
      this.selectElement.shadowRoot?.querySelector('div[part="tags"]');

    if (partTags?.childElementCount >= 2) {
      this.selectElement.classList.add("two-tags");
    } else {
      this.selectElement.classList.remove("two-tags");
    }
  }

  render() {
    return html` <sl-select
      placement="bottom"
      hoist
      class="nodeSelect"
      placeholder="Select Tasks"
      .value=${this.value}
      @sl-input=${this._handleElementSelect}
      multiple
      max-options-visible="1"
    >
      ${this.options.length === 0
        ? html`<small class="message">No tasks found in the quiz. </small>`
        : html` ${repeat(
            this.options,
            (element) => element.id,
            (element, index) => html`
              <sl-option value=${`${element.task.id}`}>
                ${`${index + 1}. ${element.taskElement.tagName
                  .replace("WEBWRITER-", "")
                  .toLowerCase()
                  .replace(/^./, (str) => str.toUpperCase())}`}
                ${element.taskElement.tagName.toLowerCase().includes("order")
                  ? html` <sl-icon slot="prefix" src=${number123}></sl-icon>`
                  : element.taskElement.tagName.toLowerCase().includes("choice")
                  ? html`<sl-icon slot="prefix" src=${checkbox}></sl-icon>`
                  : element.taskElement.tagName.toLowerCase().includes("text")
                  ? html`<sl-icon slot="prefix" src=${blockquote}></sl-icon>`
                  : element.taskElement.tagName.toLowerCase().includes("mark")
                  ? html`<sl-icon slot="prefix" src=${highlight}></sl-icon>`
                  : element.taskElement.tagName.toLowerCase().includes("speech")
                  ? html`<sl-icon slot="prefix" src=${microphone}></sl-icon>`
                  : null}

                <p
                  slot="suffix"
                  style="color: lightgray; margin: 0px; padding: 4px;"
                >
                  (${element.prompt.textContent.substring(0, 10) + "..."})
                </p>
              </sl-option>
            `
          )}`}
    </sl-select>`;
  }

  private _handleElementSelect(event: Event) {
    if (
      event.target instanceof HTMLElement &&
      event.target.tagName.toLowerCase() === "sl-select"
    ) {
      const selectedValue = (event.target as SlSelect).value;

      // If it's not an array, just assign it as-is
      this.value = selectedValue;
    }
  }
}
