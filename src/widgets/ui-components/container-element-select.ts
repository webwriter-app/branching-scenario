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
import { WebWriterGamebookPageContainer } from "../gamebook-components/webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "../gamebook-components/webwriter-gamebook-popup-container";

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

@customElement("element-children-select")
export class ElementChildrenSelect extends LitElement {
  @property({ type: Object }) accessor container;
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

  /*

  */
  // Move the option gathering logic to firstUpdated lifecycle method
  firstUpdated() {
    const containersSlot = this.container?.shadowRoot.querySelector("slot");
    const assignedElements = containersSlot.assignedElements();

    // // Check if there is a non-empty <p> element in the assignedElements
    // const hasNonEmptyP = assignedElements.some(
    //   (el) => el.tagName === "P" && el.textContent.trim() !== ""
    // );

    // if (hasNonEmptyP) {
    //   this.options = [...this.options, { tagName: "Text", id: "text" }];
    // }

    // Filter nodes with class "ww-widget" and add them to this.options
    let wwWidgetElements = assignedElements.filter((el) =>
      el.classList.contains("ww-widget")
    );

    wwWidgetElements = wwWidgetElements.filter(
      (el) =>
        el.tagName.toLowerCase().includes("webwriter-quiz") ||
        el.tagName.toLowerCase().includes("webwriter-task")
    );

    //console.log(wwWidgetElements);

    this.options = [...this.options, ...wwWidgetElements];
  }

  render() {
    return html`
      <sl-select
        placement="bottom"
        hoist
        class="nodeSelect"
        placeholder="Select element"
        clearable
        .value=${this.value}
        @sl-input=${this._handleElementSelect}
      >
        ${this.container instanceof WebWriterGamebookPageContainer
          ? html` <small class="icon-header" id="divider-page"
              ><sl-icon src="${file}"></sl-icon>${this.container
                ?.pageTitle}</small
            >`
          : this.container instanceof WebWriterGamebookPopupContainer
          ? html`<small class="icon-header" id="divider-page"
              ><sl-icon src="${squares}"></sl-icon>${this.container
                ?.pageTitle}</small
            >`
          : null}
        ${this.options.length === 0
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
              this.options,
              (element) => (element as HTMLElement).id, // or use another unique identifier
              (element) => html`
                <sl-option value=${`${(element as HTMLElement).id}`}>
                  ${(element as HTMLElement).tagName
                    .toLowerCase()
                    .includes("webwriter-task")
                    ? html`${(element as HTMLElement).children[1].tagName
                        .replace("WEBWRITER-", "")
                        .toLowerCase()
                        .replace(/^./, (str) => str.toUpperCase())}
                      ${(element as HTMLElement).children[1]?.tagName
                        .toLowerCase()
                        .includes("order")
                        ? html`
                            <sl-icon slot="prefix" src=${number123}></sl-icon>
                            <p
                              slot="suffix"
                              style="color: lightgray; margin: 0px; padding: 4px;"
                            >
                              (${element.children[0].textContent + "..."})
                            </p>
                          `
                        : (element as HTMLElement).children[1].tagName
                            .toLowerCase()
                            .includes("choice")
                        ? html`<sl-icon slot="prefix" src=${checkbox}></sl-icon>
                            <p
                              slot="suffix"
                              style="color: lightgray; margin: 0px; padding: 4px;"
                            >
                              (${element.children[0].textContent + "..."})
                            </p> `
                        : (element as HTMLElement).children[1].tagName
                            .toLowerCase()
                            .includes("text")
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
                        : (element as HTMLElement).children[1].tagName
                            .toLowerCase()
                            .includes("mark")
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
                        : (element as HTMLElement).children[1].tagName
                            .toLowerCase()
                            .includes("speech")
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
                    : (element as HTMLElement).tagName
                        .toLowerCase()
                        .includes("webwriter-quiz")
                    ? html`
                        ${(element as HTMLElement).tagName
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

      // If it's not an array, just assign it as-is
      this.value = selectedValue;
    }
  }
}

// ${(element as HTMLElement).children[1]?.tagName
//   .toLowerCase()
//   .includes("order")
//   ? html` <sl-icon slot="prefix" src=${number123}></sl-icon>`
//   : (element as HTMLElement).children[1].tagName
//       .toLowerCase()
//       .includes("choice")
//   ? html`<sl-icon slot="prefix" src=${checkbox}></sl-icon>`
//   : (element as HTMLElement).children[1].tagName
//       .toLowerCase()
//       .includes("text")
//   ? html`<sl-icon slot="prefix" src=${blockquote}></sl-icon>`
//   : (element as HTMLElement).children[1].tagName
//       .toLowerCase()
//       .includes("mark")
//   ? html`<sl-icon slot="prefix" src=${highlight}></sl-icon>`
//   : (element as HTMLElement).children[1].tagName
//       .toLowerCase()
//       .includes("speech")
//   ? html`<sl-icon slot="prefix" src=${microphone}></sl-icon>`
//   : null}
