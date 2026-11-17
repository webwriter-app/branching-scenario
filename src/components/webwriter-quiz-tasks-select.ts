import { LitElementWw } from "@webwriter/lit";
import { html, css } from "lit";
import { property, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";

import number123 from "@tabler/icons/outline/number-123.svg";
import checkbox from "@tabler/icons/outline/checkbox.svg";
import blockquote from "@tabler/icons/outline/blockquote.svg";
import highlight from "@tabler/icons/outline/highlight.svg";
import microphone from "@tabler/icons/outline/microphone.svg";

interface TaskOption {
  task: HTMLElement;
  prompt: Element;
  taskElement: Element;
}

export class WebWriterQuizTasksSelect extends LitElementWw {
  static scopedElements = {
    "sl-icon": SlIcon,
    "sl-input": SlInput,
    "sl-option": SlOption,
    "sl-select": SlSelect,
  };

  @property({ type: Object }) accessor quiz: HTMLElement;
  @property({ type: Object }) accessor taskOptions: TaskOption[] = [];
  @property({ type: String }) accessor value: string | string[];

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

    .icon-header {
      display: flex;
      align-items: center;
      gap: 7px;
    }
  `;

  firstUpdated() {
    const containersSlot = this.quiz?.shadowRoot?.querySelector("slot");
    const assignedElements = (containersSlot?.assignedElements() ?? []) as HTMLElement[];

    const tasks = assignedElements.filter((el) =>
      el.tagName.toLowerCase().includes("webwriter-task")
    );

    let taskOptions: TaskOption[] = [];

    tasks.forEach((task) => {
      const taskContent = task.children;

      const prompt = taskContent[0];
      const taskElement = taskContent[1];

      if (!taskElement.tagName.toLowerCase().includes("speech")) {
        taskOptions = [
          ...taskOptions,
          { task: task, prompt: prompt, taskElement: taskElement },
        ];
      }
    });

    this.taskOptions = [...this.taskOptions, ...taskOptions];
  }

  protected updated(): void {
    const partTags =
      this.selectElement.shadowRoot?.querySelector('div[part="tags"]');

    if (partTags && partTags.childElementCount >= 2) {
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
      <small class="icon-header" id="divider-page"
        >Select task(s) from the quiz</small
      >
      ${this.taskOptions.length === 0
        ? html`<small class="message">No tasks found in the quiz. </small>`
        : html` ${repeat(
            this.taskOptions,
            (element) => element.task.id,
            (element, index) => html`
              <sl-option value=${`${element.task.id}`}>
                ${`${index + 1}. ${element.taskElement.tagName
                  .replace("WEBWRITER-", "")
                  .toLowerCase()
                  .replace(/^./, (str: string) => str.toUpperCase())}`}
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
                  (${(element.prompt.textContent ?? "").substring(0, 10) + "..."})
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

      this.value = selectedValue;
    }
  }
}
