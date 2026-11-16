import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { html, css } from "lit";
import { property, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";

import helpOctagon from "@tabler/icons/outline/help-octagon.svg";
import textSize from "@tabler/icons/outline/text-size.svg";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";

import number123 from "@tabler/icons/outline/number-123.svg";
import checkbox from "@tabler/icons/outline/checkbox.svg";
import blockquote from "@tabler/icons/outline/blockquote.svg";
import highlight from "@tabler/icons/outline/highlight.svg";
import microphone from "@tabler/icons/outline/microphone.svg";
import packages from "@tabler/icons/outline/packages.svg";
import type { WebwriterGamebookPage } from "../widgets/webwriter-gamebook-page";
import type { WebwriterGamebookPopup } from "../widgets/webwriter-gamebook-popup";
export class WebWriterQuizSelect extends LitElementWw {
  static scopedElements = {
    "sl-icon": SlIcon,
    "sl-input": SlInput,
    "sl-option": SlOption,
    "sl-select": SlSelect,
  };

  protected readonly messages = { msg: widgetMsg(this) };
  @property({ type: Object }) accessor container: WebwriterGamebookPage | WebwriterGamebookPopup;
  @property({ type: Object }) accessor quizElements: HTMLElement[] = [];
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

    .node-option-visible {
      display: block;
    }
    .node-option-hidden {
      display: none;
    }

    .message {
      display: inline-block;
      margin: 10px 20px; /* Adjust margin for padding around the small element */
      padding: 10px; /* Optional: for internal padding */
      border-radius: 8px; /* Soft round corners */
      background-color: #f9f9f9; /* Light background for better readability */
      color: #333; /* Text color */
      font-size: 14px; /* Adjust the size of the text */
      line-height: 1.5; /* Make sure the text is well spaced */
    }

    .icon-header {
      display: flex;
      align-items: center;
      gap: 7px;
    }
  `;

  firstUpdated() {
    const containersSlot = this.container?.shadowRoot?.querySelector("slot");
    const assignedElements = (containersSlot?.assignedElements() ?? []) as HTMLElement[];

    let wwWidgetElements = assignedElements.filter((el) =>
      el.classList.contains("ww-widget")
    );

    wwWidgetElements = wwWidgetElements.filter(
      (el) =>
        el.tagName.toLowerCase().includes("webwriter-quiz") ||
        el.tagName.toLowerCase().includes("webwriter-task")
    );

    this.quizElements = [...this.quizElements, ...wwWidgetElements];
  }

  render() {
    return html`
      <sl-select
        placement="bottom"
        hoist
        class="nodeSelect"
        placeholder=${this.messages.msg("Select element")}
        clearable
        .value=${this.value}
        @sl-input=${this._handleElementSelect}
      >
        ${this.container.constructor ===
        customElements.get("webwriter-gamebook-page")
          ? html` <small class="icon-header" id="divider-page"
              ><sl-icon src="${file}"></sl-icon>${this.container
                ?.pageTitle}</small
            >`
          : this.container.constructor ===
            customElements.get("webwriter-gamebook-popup")
          ? html`<small class="icon-header" id="divider-page"
              ><sl-icon src="${squares}"></sl-icon>${this.container
                ?.pageTitle}</small
            >`
          : null}
        ${this.quizElements.length === 0
          ? html`<small class="message"
              >No quiz element found.
              <br />
              Download the quiz WebWriter Quiz Widget over packages
              <sl-icon
                src="${packages}"
                style="vertical-align: middle; margin: 1px;"
              ></sl-icon
            ></small>`
          : html`${repeat(
              this.quizElements,
              (element) => element.id,
              (element) => {
                const quizType = this._getQuizType(element);

                return html`
                  <sl-option value=${`${element.id}`}>
                    ${element.tagName
                      .toLowerCase()
                      .includes("webwriter-task")
                      ? html`${this._getQuizTypeName(element)}
                        ${quizType === QuizType.ORDER
                          ? html`
                              <sl-icon slot="prefix" src=${number123}></sl-icon>
                              <p
                                slot="suffix"
                                style="color: lightgray; margin: 0px; padding: 4px;"
                              >
                                (${element.children[0].textContent + "..."})
                              </p>
                            `
                          : quizType === QuizType.CHOICE
                          ? html`<sl-icon slot="prefix" src=${checkbox}></sl-icon>
                              <p
                                slot="suffix"
                                style="color: lightgray; margin: 0px; padding: 4px;"
                              >
                                (${element.children[0].textContent + "..."})
                              </p> `
                          : quizType === QuizType.TEXT
                          ? html`<sl-icon
                                slot="prefix"
                                src=${blockquote}
                              ></sl-icon>
                              <p
                                slot="suffix"
                                style="color: lightgray; margin: 0px; padding: 4px;"
                              >
                                (${element.children[0].textContent + "..."})
                              </p> `
                          : quizType === QuizType.MARK
                          ? html`<sl-icon
                                slot="prefix"
                                src=${highlight}
                              ></sl-icon>
                              <p
                                slot="suffix"
                                style="color: lightgray; margin: 0px; padding: 4px;"
                              >
                                (${element.children[0].textContent + "..."})
                              </p> `
                          : quizType === QuizType.SPEECH
                          ? html`<sl-icon
                                slot="prefix"
                                src=${microphone}
                              ></sl-icon>
                              <p
                                slot="suffix"
                                style="color: lightgray; margin: 0px; padding: 4px;"
                              >
                                (${element.children[0].textContent + "..."})
                              </p> `
                          : null} `
                      : element.tagName
                          .toLowerCase()
                          .includes("webwriter-quiz")
                      ? html`
                          ${element.tagName
                            .replace("WEBWRITER-", "")
                            .toLowerCase()
                            .replace(/^./, (str) => str.toUpperCase())}
                          ${element.tagName.toLowerCase().includes("quiz")
                            ? html`<sl-icon
                                slot="prefix"
                                src=${helpOctagon}
                              ></sl-icon>`
                            : null}
                        `
                      : null}
                  </sl-option>
                `
              }
            )}`}
      </sl-select>
    `;
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

  private _getQuizType(element: HTMLElement): QuizType {
    const tagName = element.tagName.toLowerCase();

    if (tagName !== "webwriter-task") {
      return QuizType.UNKNOWN;
    }

    const childTagNames = Array.from(element.children).map((child) =>
      child.tagName.toLowerCase()
    );

    for (const childTagName of childTagNames) {
      if (childTagName.includes("order")) {
        return QuizType.ORDER;
      } else if (childTagName.includes("choice")) {
        return QuizType.CHOICE;
      } else if (childTagName.includes("text")) {
        return QuizType.TEXT;
      } else if (childTagName.includes("mark")) {
        return QuizType.MARK;
      } else if (childTagName.includes("speech")) {
        return QuizType.SPEECH;
      }
    }

    return QuizType.UNKNOWN;
  }

  private _getQuizTypeName(element: HTMLElement): string {
    if (this._getQuizType(element) !== QuizType.UNKNOWN) {
      return this._getQuizType(element);
    } else {
      return (Array.from(element.children).at(-1)?.tagName ?? "")
        .toLowerCase()
        .replace("webwriter-", "")
        .replace(/^./, (str) => str.toUpperCase())
    }
  }
}

enum QuizType {
  ORDER = "Order",
  CHOICE = "Choice",
  TEXT = "Text",
  MARK = "Mark",
  SPEECH = "Speech",
  UNKNOWN = "Unknown",
}
